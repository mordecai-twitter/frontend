import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'
import { core } from './core'

class Trivia {
  // #UniboSWE3 #TriviaGame #NewTrivia #[trivia name]
  constructor (name) {
    this.name = name
    this.questions = {}
    this.players = []
  }

  getQuestions () {
    return this.questions
  }

  getPartecipants () {
    return this.players
  }

  async fetchQuestions () {
    const keyword = `#UniboSWE3 #TriviaGame #_${this.name} #Question`
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
    const query = director.makeContestQuery(keyword).get()
    const res = await this.api.contest(query)
    // Proposal loading
    const answers = res.data.reverse()
    for (const answer of answers) {
      // #uniboswe3 #contest #nomeContest #Proposal #nomePrposta
      this.addVoter(answer)
    }
  }

  addPlayer (player) {
    // TODO: Sistemare l'option parsing, samuele ha detto che non si tweeta direttamente con #numero
    const answer = player.text.match(/#[1-4]*/g)[0].replace(/#[1-4]_/, '')
    const questionName = player.text.match(/#_[A-Za-z_]*/g)[0]
    if (!this.players[player.author_id]) {
      this.players[player.author_id] = new Player(player.author_id)
    }
    this.players[player.author_id].addAnswer(questionName, answer)
    // TODO: Allow voters to answer non-proposed question?
    this.players[player.author_id]?.addVote(this.players[questionName])
  }

  async addQuestion (question) {
    const questionName = question.text.match(/#_[A-Za-z_]*/g)[0]
    // TODO: Sistemare l'option parsing, samuele ha detto che non si tweeta direttamente con #numero
    // Parse options removing the hastag and the number
    // #1_oxygen -> oxygen
    const options = question.text.match(/#([1-4])\w+/g).map(op => op.replace(/#[1-4]_/, ''))
    if (!this.questions[questionName]) {
      this.questions[questionName] = new Question(this.name, questionName, options)
      // Search an existing solution
      await this.questions[questionName].searchSolution()
    }
  }

  /**
  * @summary Check if the Trivia exists
  * @param {string} name - Trivia name
  * @returns boolean
  */
  static async checkTrivia (name) {
    const keyword = `#UniboSWE3 #TriviaGame #${name} #NewTrivia`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await (new Twitter()).contest(query)
    return res.data.length === 0
  }
}

class Question {
  // #UniboSWE3 #TriviaGame #[trivia name] #Question #_[question name] #1_[option1]
  // #2_[option2]#3_[option3]#4_[option4]
  constructor (trivia, name, options) {
    // Solution is the option number
    this.solution = undefined
    this.options = options
    this.name = name
    this.trivia = trivia
  }

  /**
  * @summary Check if a solution exists
  */
  async searchSolution () {
    // #UniboSWE3 #TriviaGame #[trivia name] #Solution #_[question name] #[option number]
    const keyword = `#UniboSWE3 #TriviaGame #${this.trivia} #_${this.name} #Solution`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeTriviaQuery(keyword).get()
    const res = await this.api.trivia(query)
    // TODO: Nel caso vengano postate piu' soluzioni prendiamo l'ultima postata
    if (res.data.length > 0) {
      const text = res.data[0].text
      // TODO: Sistemare l'option parsing, samuele ha detto che non si tweeta direttamente con #numero
      // Set the solution to the firtst option hasthag
      this.setSolution(text.match(/#[1-4]*/g)[0], res.data[0].id)
    }
  }

  /**
  * @summary Set solution
  * @param {string} solution - Number of the correct option
  * @param {string} deadline - Time deadline
  */
  setSolution (solution, deadline) {
    // TODO: Sistemare l'option parsing, samuele ha detto che non si tweeta direttamente con #numero
    this.solution = { solution: solution.replace(/#[1-4]_/, ''), deadline }
  }

  checkSolution (answer, time) {
    return answer === this.getSolution() && this.getDeadline() > time
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
    this.points = 0
    // Stores the player answers { 'question name': { 'selected option' }
    this.answers = {}
  }

  // TODO: Va aggiunto oltre alla risposta data il quando e' stata fatta (id oppure timestamp)
  // si potrebbe evitare andando a filtrare anche per id/data i tweet di answer
  addAnswer (question, answer) {
    this.answers[question] = answer
  }

  getPoints () {
    return this.points
  }
}

export { Trivia }
