import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'
import { core } from './core'

class Trivia {
  // #UniboSWE3 #TriviaGame #NewTrivia #[trivia name]
  constructor (name) {
    this.name = name
    this.questions = {}
    this.players = {}
    this.isStreaming = false
    this.creator = undefined
    this.api = new Twitter()
  }

  async init () {
    await this.fetchQuestions()
    await this.fetchPlayers()
  }

  getQuestions () {
    return this.questions
  }

  getPlayers () {
    return this.players
  }

  async fetchQuestions () {
    const keyword = `#UniboSWE3 #TriviaGame #${this.name} #Question`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await this.api.trivia(query)
    const questions = res.data
    for (const question of questions) {
      this.addQuestion(question)
    }
  }

  async fetchPlayers () {
    // #UniboSWE3 #TriviaGame #[trivia name] #Answer #_[question name] #[option number]
    const keyword = `#UniboSWE3 #TriviaGame #${this.name} #Answer`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await this.api.trivia(query)
    // Proposal loading
    const answers = res.data.reverse()
    for (const answer of answers) {
      this.addPlayer(answer)
    }
  }

  addPlayer (player) {
    const answer = player.text.match(/#A_[1-4]\w*/g)[0].replace(/#A_/g, '')
    console.log('Answer: ', answer)
    const questionName = player.text.match(/#_\w+/g)[0]
    if (Object.keys(this.questions).includes(questionName)) {
      if (!this.players[player.author_id]) {
        this.players[player.author_id] = new Player(player.author_id)
      }
      this.players[player.author_id].addAnswer(questionName, answer, player.created_at)
    }
  }

  async addQuestion (question) {
    // Looking for Trivia Creator
    if (!this.creator) {
      const keyword = `#UniboSWE3 #TriviaGame #New #${this.name}`
      const director = new QueryDirector(new V2Builder())
      const query = director.makeTriviaQuery(keyword).get()
      const res = await this.api.trivia(query)
      this.creator = res.data[res.data.length - 1].author_id
    }
    if (this.creator === question.author_id) {
      const questionName = question.text.match(/#_[A-Za-z_]*/g)[0]
      // Parse options removing the hastag and the number
      // #1_oxygen -> oxygen
      const options = question.text.match(/#([1-4]_)\w+/g).map(op => op.replace(/#[1-4]_/, ''))
      if (!this.questions[questionName]) {
        this.questions[questionName] = new Question(this.name, questionName, options)
        // Search an existing solution
        await this.questions[questionName].searchSolution()
      }
    }
  }

  /**
  * @summary Check if the Trivia exists
  * @param {string} name - Trivia name
  * @returns boolean
  */
  static async checkTrivia (name) {
    const keyword = `#UniboSWE3 #TriviaGame #New #${name}`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await (new Twitter()).trivia(query)
    return res.data.length === 0
  }

  /**
  * @summary Go live with the Trivia.
  * @param {Object} votes - Real time Answer to update
  *
  */
  live (callback) {
    const keyword = `#UniboSWE3 #TriviaGame #${this.name}`
    const query = {}
    query.keywords = keyword
    core.stream(query, (tweet) => {
      tweet.author_id = tweet.user.id_str
      this.isStreaming = true
      const isNewQuestion = tweet.text.match(/#(Q|q)uestion/g)
      const isAnswer = tweet.text.match(/#(A|a)nswer/g)
      const isSolution = tweet.text.match(/#(S|s)olution/g)
      if (isNewQuestion) {
        this.addQuestion(tweet)
      } else if (isAnswer) {
        this.addPlayer(tweet)
      } else if (isSolution) {
        const question = tweet.text.match(/#_w+/g)[0]
        const solution = tweet.match(/#(S|s)_[1-4]/g)[0]
        this.questions[question].setSolution(solution, tweet.created_at)
      }
      callback(this.getScores())
    }, () => {
      this.isStreaming = false
    })
  }

  getScores () {
    const results = {}
    for (const [playerId, player] of Object.entries(this.players)) {
      results[playerId] = 0
      for (const [question, answer] of Object.entries(player.getAnswer())) {
        results[playerId] += this.questions[question].checkSolution(answer.option, answer.time)
      }
    }
    return results
  }

  abort () {
    this.isStreaming = false
    core.abortStream()
  }
}

class Question {
  // #UniboSWE3 #TriviaGame #[trivia name] #Question #_[question name] #1_[option1]
  // #2_[option2] #3_[option3] #4_[option4]
  constructor (trivia, name, options) {
    // Solution is the option number
    this.solution = undefined
    this.options = options
    this.name = name
    this.trivia = trivia
    this.api = new Twitter()
  }

  /**
  * @summary Check if a solution exists
  */
  async searchSolution () {
    // #UniboSWE3 #TriviaGame #[trivia name] #Solution #_[question name] #[option number]
    // TODO: The solution must be given by the creator
    const keyword = `#UniboSWE3 #TriviaGame #${this.trivia} ${this.name} #Solution`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await this.api.trivia(query)
    // Nel caso vengano postate piu' soluzioni prendiamo l'ultima postata
    if (res.data.length > 0) {
      const text = res.data[0].text
      // Set the solution to the firtst option hasthag
      this.setSolution(text.match(/#(S|s)_[1-4]\w*/g)[0], res.data[0].created_at)
    }
  }

  /**
  * @summary Set solution
  * @param {string} solution - Number of the correct option
  * @param {string} deadline - Time deadline
  */
  setSolution (solution, deadline) {
    // TODO: Sistemare l'option parsing, samuele ha detto che non si tweeta direttamente con #numero CREDO FATTO
    this.solution = { solution: solution.replace(/#(S|s)_/, ''), deadline }
    console.log('After set solution: ', this.solution)
  }

  checkSolution (answer, time) {
    console.log(answer, time, this.solution)
    return (this.solution && answer === this.getSolution() && this.getDeadline() > time) ? 1 : 0
  }

  getDeadline () {
    return this.solution.deadline
  }

  getSolution () {
    return this.solution.solution
  }

  getOptions () {
    return this.options
  }

  getName () {
    return this.name
  }
}

class Player {
  constructor (id) {
    this.id = id
    // Stores the player answers { 'question name': { 'selected option' }
    this.answers = {}
  }

  getAnswer () {
    return this.answers
  }

  // TODO: Va aggiunto oltre alla risposta data il quando e' stata fatta (id oppure timestamp)
  // si potrebbe evitare andando a filtrare anche per id/data i tweet di answer
  addAnswer (question, option, time) {
    // facciamo già il reverse dell'array contenente le risposte, quindi ci basterebbe controllare se this.answer[question]!==null
    if (!this.answers[question]) {
      this.answers[question] = { option, time }
    }
  }
}

export { Trivia }
