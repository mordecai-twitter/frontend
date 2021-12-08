<template>
  <c-box id="wrapper" m="2em" mt="4em">
    <c-stack color="black">
      <c-alert v-if="this.messageType" :status="this.messageType">
        <c-alert-icon />
        {{ this.message }}
        <c-close-button position="absolute" right="8px" top="8px" @click="() => {this.messageType = ''}"/>
      </c-alert>
    </c-stack>
    <c-input variant="flushed" v-model="triviaName" type="text" placeholder="Insert here your trivia name" />
    <c-stack :spacing="5" is-inline align="center" justify="center">
      <c-button variant-color="black" type="button" name="button" @click="searchTrivia()">Search</c-button>
      <c-button variant-color="black" type="button" name="button" @click="createTrivia()">Create</c-button>
    </c-stack>
    <c-box v-if="this.trivia">
      <c-heading>Trivia: {{ this.trivia.name }}</c-heading>
      <c-box>
        <c-input variant="flushed" v-model="questionName" placeholder="Insert here the question name"></c-input>
        <c-input variant="flushed" v-model="questionText" placeholder="Insert here the question text"></c-input>
        <c-input variant="flushed" v-model="possibleAnswer" placeholder="Insert here possible answer"></c-input>
        <c-button variant-color="black" @click="insertPossibleAnswer()">Insert possible answer</c-button>
        <c-button variant-color="black" @click="createQuestion()">Create Question</c-button>

        <c-heading size="sm" v-if="possibleAnswers.length > 0">Inserted options:</c-heading>
        <c-box v-for="(answer, index, a) in possibleAnswers" :key="answer">
          <c-text>{{ index + 1 }}. {{ answer }} {{ a }}</c-text>
        </c-box>
      </c-box>
      <c-box>
        <c-heading>Questions</c-heading>
        <c-spinner v-if="loading" />
        <c-box v-else v-for="question in questions" :key="question.name">
          <c-heading as="h4" size="sm">{{ question.text || "** question text **" }}</c-heading>
          <c-box v-for="(option, index, a) in Object.keys(question.answers)" :key="option">
            <c-text>{{ index + 1 }}. {{ option }} {{ a }}</c-text>
            <c-button variant-color="blue" @click="sendAnswer(index, question.name)">Choose Answer</c-button>
          </c-box>
          <AnswerChart :answers="question.answers" />
        </c-box>
      </c-box>
      <c-box>
        <c-heading>Stats</c-heading>
      </c-box>
      <c-box>
        <c-heading>Leaderboard</c-heading>
        <c-input variant="flushed" v-model="leaderboardFilter" placeholder="Filter by username"></c-input>
        <c-box v-for="([index, username, score]) in getFilteredLeaderboard(leaderboardFilter)" :key="index">
          <c-text>{{ index + 1 }}. {{ username }} {{ score }}</c-text>
        </c-box>
      </c-box>
    </c-box>
  </c-box>
</template>

<script>
import { Trivia } from '../../common/trivia'
export default {
  components: {

  },
  computed: {
    leaderboard () {
      return Object.entries(this.scores)
        .map(([id, score]) => {
          return [this.trivia.getPlayers()[id].getUsername(), score]
        })
        .sort((a, b) => {
          return b[1] - a[1]
        })
    }
  },
  data () {
    return {
      triviaName: '',
      questionText: '',
      questionName: '',
      trivia: undefined,
      possibleAnswers: [],
      possibleAnswer: '',
      questions: [],
      isAuthor: false,
      isCreating: false,
      loading: false,
      message: '',
      messageType: '', // info, success, warning, error
      leaderboardFilter: '',
      scores: {}
    }
  },
  methods: {
    notifyUser (message, type) {
      this.message = message
      this.messageType = type
    },
    composeTweet (tweet, title, onClosed) {
      this.dialogClosed = false
      const win = window.open('https://twitter.com/intent/tweet?text=' + encodeURIComponent(tweet), title, 'width=600,height=400')
      const timer = setInterval(() => {
        if (win.closed) {
          clearInterval(timer)
          this.dialogClosed = true
          if (onClosed) {
            onClosed()
          }
        }
      }, 500)
    },
    parseQuestions (questions) {
      return Object.values(questions).map(q => (
        {
          text: q.getText(),
          name: q.getName().substring(2).replace('_', ' '),
          answers: this.trivia.getQuestionResults(q.getName())
        }
      ))
    },
    async searchTrivia () {
      if (this.trivia) {
        this.trivia.abort()
      }
      if (this.triviaName === '') {
        this.notifyUser('Please insert a trivia name', 'warning')
      } else if (await Trivia.checkTrivia(this.triviaName)) {
        this.notifyUser('Trivia not found', 'error')
      } else {
        this.trivia = new Trivia(this.triviaName)
        this.loading = true
        await this.trivia.init()
        this.loading = false
        this.questions = this.parseQuestions(this.trivia.getQuestions())
        this.scores = await this.trivia.getScores()
        this.trivia.live((scores, questions, _) => {
          this.questions = this.parseQuestions(questions)
          this.scores = scores
        })
      }
    },
    async createTrivia () {
      if (this.trivia) {
        this.trivia.abort()
      }
      if (this.triviaName === '') {
        this.notifyUser('Please insert a trivia name', 'warning')
      } else if (!(await Trivia.checkTrivia(this.triviaName))) {
        this.notifyUser('Trivia already exists', 'error')
      } else {
        const triviaName = this.triviaName.replace(/\s/g, '_')
        this.composeTweet(`#UniboSWE3 #TriviaGame #New #${triviaName}`, 'New Trivia', () => {
          this.searchTrivia()
        })
      }
    },
    insertPossibleAnswer () {
      this.possibleAnswers.push(this.possibleAnswer)
      this.possibleAnswer = ''
    },
    createQuestion () {
      if (this.questionName === '') {
        this.notifyUser('Please insert a question name', 'warning')
      } else if (this.questionText === '') {
        this.notifyUser('Please insert a question text', 'warning')
      } else if (this.possibleAnswers.length === 0) {
        this.notifyUser('Please insert at least one possible answer', 'warning')
      } else {
        const triviaName = this.triviaName.replace(/\s/g, '_')
        const questionName = this.questionName.replace(/\s/g, '_')
        const possibleAnswers = []
        for (const i in this.possibleAnswers) {
          possibleAnswers.push(`#${parseInt(i) + 1}_` + this.possibleAnswers[i].replace(/\s/g, '_'))
        }
        this.composeTweet(`${this.questionText} #UniboSWE3 #TriviaGame #${triviaName} #Question #_${questionName} ${possibleAnswers.join(' ')} `, 'New Question', () => {
          // this.trivia.createQuestion(this.questionName, this.questionText, this.possibleAnswers)
          this.possibleAnswers = []
          this.questionName = ''
          this.questionText = ''
        })
      }
    },
    sendAnswer (answerNumber, questionName) {
      const triviaName = this.triviaName.replace(/\s/g, '_')
      this.composeTweet(`#UniboSWE3 #TriviaGame #${triviaName} #Answer #_${questionName} #A_${answerNumber + 1}`)
    },
    getFilteredLeaderboard (filter) {
      const filteredLeaderboard = []

      for (const i in this.leaderboard) {
        const [username, score] = this.leaderboard[i]
        if (username.toLowerCase().includes(filter.toLowerCase())) {
          filteredLeaderboard.push([parseInt(i), username, score])
        }
      }

      return filteredLeaderboard
    }
  }
}

</script>
