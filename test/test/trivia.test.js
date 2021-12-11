import { Trivia, Question, Player } from '../../common/trivia'
import Twitter from '../../common/twitter'
import { core } from '../../common/core'

jest.mock('../../common/twitter')
jest.mock('../../common/core')

describe('Test for Trivia file', () => {
  describe('Test for Player class', () => {
    let player = {}
    const playerID = '1449658830086934530'

    beforeEach(() => {
      player = new Player(playerID)
    })

    it('fetch Username should fetch the username from twitter Api', async () => {
      Twitter.prototype.userById.mockResolvedValue({ data: { username: 'userTest' } })
      await player.fetchUsername()
      expect(Twitter.prototype.userById).toHaveBeenCalledTimes(1)
      expect(Twitter.prototype.userById).toHaveBeenCalledWith(playerID, {})
    })

    it('Get username should return the username fetched by fetchUsername', async () => {
      Twitter.prototype.userById.mockResolvedValue({ data: { username: 'userTest' } })
      await player.fetchUsername()
      expect(player.getUsername()).toBe('userTest')
    })

    it('Get answer should return an empty object if no answer were added', async () => {
      expect(player.getAnswer()).toEqual({})
    })

    it('Add answer should add an answer, so the next call to get answer should return the answer added', async () => {
      const question = 'questionTest'
      const option = 2
      const time = Date.now()
      player.addAnswer(question, option, time)

      const expectedAnswer = {}
      expectedAnswer[question] = { option, time }

      expect(player.getAnswer()).toEqual(expectedAnswer)
    })
  })

  describe('Test for the Question class', () => {
    let question = {}
    const trivia = 'trivia'
    const name = 'triviaNameTest'
    const text = ''
    const option = ['', '']

    beforeEach(() => {
      question = new Question(trivia, name, text, option)
    })

    it('The getters should return the right value', () => {
      expect(question.getOptions()).toBe(option)
      expect(question.getName()).toBe(name)
      expect(question.getText()).toBe(text)
    })

    it('getSolution should return undefined if no solution was set', () => {
      expect(question.getSolution()).toBe(undefined)
    })

    it('set Solution should set the solution of the trivia and a deadline', () => {
      const solution = '#S_2'
      const deadline = Date.now()
      question.setSolution(solution, deadline)
      expect(question.getSolution()).toBe('2')
      expect(question.getDeadline()).toBe(deadline)
    })

    it('Check deadline should return whether the answer is in time or not', () => {
      const solution = '#S_2'
      const deadline = new Date('December 17, 2021 00:0:00')
      question.setSolution(solution, deadline)

      const answerTime = new Date('December 14, 2021 00:0:00')
      expect(question.checkDeadline(answerTime)).toBe(true)

      const answerTime2 = new Date('December 19, 2021 00:0:00')
      expect(question.checkDeadline(answerTime2)).toBe(false)
    })

    it('searchSolution should call the Twitter Api', async () => {
      const authorID = '1449658830086934530'
      const mockedResponse = {
        data: [
          {
            authorID: '1449658830086934530',
            text: `Risposta test per il trivia #UniboSWE3 #TriviaGame #${trivia} ${name} #Solution #S_2`,
            created_at: new Date('December 17, 2021 00:0:00')
          },
          {
            authorID: '1449658830086934530',
            text: `Risposta test per il trivia #UniboSWE3 #TriviaGame #${trivia} ${name} #Solution #S_3`,
            created_at: new Date('December 16, 2021 00:0:00')
          }
        ]
      }

      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await question.searchSolution(authorID)
      expect(Twitter.prototype.trivia).toHaveBeenCalledTimes(1)
    })

    it('searchSolution should get only an answer from each author, and set as solution', async () => {
      const authorID = '1449658830086934530'
      const mockedResponse = {
        data: [
          {
            authorID: '1449658830086934530',
            text: `Risposta test per il trivia #UniboSWE3 #TriviaGame #${trivia} ${name} #Solution #S_2`,
            created_at: new Date('December 17, 2021 00:0:00')
          },
          {
            authorID: '1449658830086934530',
            text: `Risposta test per il trivia #UniboSWE3 #TriviaGame #${trivia} ${name} #Solution #S_3`,
            created_at: new Date('December 16, 2021 00:0:00')
          }
        ]
      }

      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await question.searchSolution(authorID)
      expect(question.getSolution()).toBe('2')
    })
  })

  describe('Test for the Trivia class', () => {
    let trivia = {}
    const name = 'trivaName'

    beforeEach(() => {
      trivia = new Trivia(name)
    })

    it('getQuestions should return an empty object if no question was inserted', () => {
      expect(trivia.getQuestions()).toEqual({})
    })

    it('getPlayers should return an empty object if no player was inserted', () => {
      expect(trivia.getPlayers()).toEqual({})
    })

    it('addQuestion should add a question to the trivia', async () => {
      const authorID = '1449658830086934530'
      const questionName = '#_questionName'
      const questionText = 'testo question'
      const questionOption = '#1_opzione1 #2_opzione2 #3_opzione3'
      const mockedResponse = {
        data: [{
          text: `#UniboSWE3 #TriviaGame #New #${name}`,
          author_id: authorID
        }]
      }
      const question = {
        author_id: authorID,
        text: `#UniboSWE3 #TriviaGame ${questionName} ${questionOption} ${questionText}`
      }

      Question.prototype.searchSolution = jest.fn()
      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await trivia.addQuestion(question)

      const expectedQuestions = {}
      expectedQuestions[questionName] = new Question(name, questionName, questionText, ['opzione1', 'opzione2', 'opzione3'])

      expect(JSON.stringify(trivia.getQuestions())).toEqual(JSON.stringify(expectedQuestions))
      expect(Question.prototype.searchSolution).toHaveBeenCalledTimes(1)
    })

    it('addPlayer should ad a player to the trivia', async () => {
      // FIRST WE ADD A QUESTION
      const authorID = '1449658830086934530'
      const questionName = '#_questionName'
      const questionText = 'testo question'
      const questionOption = '#1_opzione1 #2_opzione2 #3_opzione3'
      const mockedResponse = {
        data: [{
          text: `#UniboSWE3 #TriviaGame #New #${name}`,
          author_id: authorID
        }]
      }
      const question = {
        author_id: authorID,
        text: `#UniboSWE3 #TriviaGame ${questionName} ${questionOption} ${questionText}`
      }

      Question.prototype.searchSolution = jest.fn()
      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await trivia.addQuestion(question)

      const player = {
        author_id: '1449658830086934503',
        text: `Risposta al trivia ${questionName} #A_2`
      }

      Twitter.prototype.userById.mockResolvedValue({ data: { username: 'usernameTest' } })
      await trivia.addPlayer(player)

      const expectedPlayer = {}
      expectedPlayer['1449658830086934503'] = new Player('1449658830086934503')
      expectedPlayer['1449658830086934503'].username = 'usernameTest'
      expectedPlayer['1449658830086934503'].answers = {}
      expectedPlayer['1449658830086934503'].answers[questionName] = {
        option: '2',
        time: undefined
      }
      expect(trivia.getPlayers()).toEqual(expectedPlayer)
    })

    it('Fetch Question should call the twitter api', async () => {
      Twitter.prototype.trivia.mockResolvedValue({ data: [] })
      await trivia.fetchQuestions()
      expect(Twitter.prototype.trivia).toHaveBeenCalled()
    })

    it('fetchPlayers should call the twitter api', async () => {
      Twitter.prototype.trivia.mockResolvedValue({ data: [] })
      await trivia.fetchQuestions()
      expect(Twitter.prototype.trivia).toHaveBeenCalled()
    })

    it('checkTrivia should call the Twitter Api and return if the trivia exists', async () => {
      Twitter.prototype.trivia.mockResolvedValue({ data: [] })
      const response = await Trivia.checkTrivia('nonexistantTrivia')
      expect(Twitter.prototype.trivia).toHaveBeenCalled()
      expect(response).toBe(true)
    })

    it('Get score should return the current score of the player, since the correct answer was not given it should return 0 for each player', async () => {
      // FIRST WE ADD A QUESTION
      const authorID = '1449658830086934530'
      const questionName = '#_questionName'
      const questionText = 'testo question'
      const questionOption = '#1_opzione1 #2_opzione2 #3_opzione3'
      const mockedResponse = {
        data: [{
          text: `#UniboSWE3 #TriviaGame #New #${name}`,
          author_id: authorID
        }]
      }
      const question = {
        author_id: authorID,
        text: `#UniboSWE3 #TriviaGame ${questionName} ${questionOption} ${questionText}`
      }

      Question.prototype.searchSolution = jest.fn()
      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await trivia.addQuestion(question)

      // THEN WE ADD A PLAYER
      const player = {
        author_id: '1449658830086934503',
        text: `Risposta al trivia ${questionName} #A_2`
      }

      Twitter.prototype.userById.mockResolvedValue({ data: { username: 'usernameTest' } })
      await trivia.addPlayer(player)

      expect(trivia.getScores()).toEqual({
        '1449658830086934503': 0
      })
    })

    it('Get score should return the current score of the player, since the correct answer was not given it should return 0 for each player', async () => {
      // FIRST WE ADD A QUESTION
      const authorID = '1449658830086934530'
      const questionName = '#_questionName'
      const questionText = 'testo question'
      const questionOption = '#1_opzione1 #2_opzione2 #3_opzione3'
      const mockedResponse = {
        data: [{
          text: `#UniboSWE3 #TriviaGame #New #${name}`,
          author_id: authorID
        }]
      }
      const question = {
        author_id: authorID,
        text: `#UniboSWE3 #TriviaGame ${questionName} ${questionOption} ${questionText}`
      }

      Question.prototype.searchSolution = jest.fn()
      Twitter.prototype.trivia.mockResolvedValue(mockedResponse)
      await trivia.addQuestion(question)

      // THEN WE ADD A PLAYER
      const player = {
        author_id: '1449658830086934503',
        text: `Risposta al trivia ${questionName} #A_2`
      }

      Twitter.prototype.userById.mockResolvedValue({ data: { username: 'usernameTest' } })
      await trivia.addPlayer(player)

      expect(trivia.getQuestionResults('#_questionName')).toEqual({
        opzione1: 0,
        opzione2: 1,
        opzione3: 0
      })
    })

    it('Live should call the Twitter Api stream', () => {
      trivia.live(() => {})
      expect(core.stream).toHaveBeenCalled()
    })
  })
})
