<template>
  <c-box id="wrapper" m="2em" mt="4em">
    <c-stack color="black">
      <c-alert v-if="this.messageType" :status="this.messageType">
        <c-alert-icon />
        {{ this.message }}
        <c-close-button position="absolute" right="8px" top="8px" @click="() => {this.messageType = ''}"/>
      </c-alert>
    </c-stack>
    <c-input v-on:keyup.enter="searchTrivia()" variant="flushed" v-model="triviaName" type="text" placeholder="Insert here your trivia name" />
    <c-stack :spacing="5" is-inline align="center" justify="center">
      <c-button :isDisabled="!this.triviaName" variant-color="black" type="button" name="button" @click="searchTrivia()">Search</c-button>
      <c-button :isDisabled="!this.triviaName" variant-color="black" type="button" name="button" @click="createTrivia()">Create</c-button>
    </c-stack>
    <c-box v-if="this.trivia">
      <c-heading mb="0.3em">Trivia: {{ this.trivia.name }}</c-heading>
      <c-tabs>
        <c-tab-list>
          <c-tab>New question</c-tab>
          <c-tab>Questions</c-tab>
          <c-tab>Leaderboard</c-tab>
        </c-tab-list>
        <c-tab-panels>
          <c-tab-panel>
            <c-heading mt="0.5em" mb="0.3em">New question</c-heading>
            <c-box>
              <c-input variant="flushed" v-model="questionText" v-on:keyup.enter="insertQuestionText()" placeholder="Question text" ></c-input>
              <c-button :isDisabled="!questionText" variant-color="black" @click="insertQuestionText()" v-if="questionCreationStage === 'questionText'">Next</c-button>
            </c-box>
            <c-box v-if="questionCreationStage === 'options' || questionCreationStage === 'questionName'">
            <c-flex>
              <c-input w="15em" variant="flushed" v-model="possibleAnswer" v-on:keyup.enter="insertPossibleAnswer()" placeholder="Possible answer"></c-input>
              <c-button variant-color="black" :isDisabled="!this.possibleAnswer" @click="insertPossibleAnswer()">Add option</c-button>
            </c-flex>
              <c-heading size="sm" v-if="possibleAnswers.length > 0">Inserted options:</c-heading>
              <c-flex v-for="(answer, index, a) in possibleAnswers" :key="answer">
                <c-text w="10em">{{ index + 1 }}. {{ answer }} {{ a }}</c-text>
                <c-icon-button
                  class="close"
                  color="red.500"
                  size="0.6em"
                  aria-label="Search database"
                  icon="close"
                  bg="transparent"
                  @click="deleteOption(index)"
                  :_hover="{ bg: 'transparent' }"
                />
              </c-flex>
              <c-button variant-color="black" @click="insertOptions" :isDisabled="this.possibleAnswers.length === 0" v-if="questionCreationStage === 'options'">Next</c-button>
            </c-box>
            <c-box v-if="questionCreationStage === 'questionName'">
              <c-input v-on:keyup.enter="createQuestion()" variant="flushed" v-model="questionName" placeholder="Name your question"></c-input>
              <c-button variant-color="white" :isDisabled="!this.questionName" @click="createQuestion()">Create Question</c-button>
            </c-box>
          </c-tab-panel>
          <c-tab-panel>
            <c-heading mt="0.5em" mb="0.3em">Questions</c-heading>
            <c-spinner v-if="loading" />
            <c-box
              v-else
              v-for="question in questions"
              :key="question.name"
              border-width="1px"
              p="1em"
              m="1em"
            >
              <c-flex>
                <c-box width="25%">
                  <c-heading as="h4" size="sm">{{ question.text || "** question text **" }}</c-heading>
                  <c-flex>
                    <c-box width="25em">
                      <c-box width="25em" mb="0.5em" v-for="(option, index, a) in Object.keys(question.answers)" :key="option">
                        <c-text>{{ index + 1 }}. {{ option }} {{ a }} <c-icon name="check-circle" color="green.500" v-if="index === question.solution" /></c-text>
                        <c-box v-if="question.solution === undefined">
                          <c-button variant-color="blue" @click="sendAnswer(index, question.name)">Choose Answer</c-button>
                          <c-button variant-color="green" @click="sendSolution(index, question.name)">Mark as Correct</c-button>
                        </c-box>
                      </c-box>
                    </c-box>
                    <c-box>
                      <AnswerChart :answers="question.answers" />
                    </c-box>
                  </c-flex>
                </c-box>
              </c-flex>
            </c-box>
          </c-tab-panel>
          <c-tab-panel>
            <c-heading mt="0.5em" mb="0.3em">Leaderboard</c-heading>
            <c-input variant="flushed" v-model="leaderboardFilter" placeholder="Filter by username"></c-input>
            <c-box v-for="([index, username, score]) in getFilteredLeaderboard(leaderboardFilter)" :key="index">
              <c-text>{{ index + 1 }}. {{ username }} {{ score }} </c-text>
            </c-box>
          </c-tab-panel>
        </c-tab-panels>
      </c-tabs>
    </c-box>
  </c-box>
</template>

<script>
import {
  CBox, CTabs, CTabList, CTab, CTabPanel, CTabPanels, CHeading, CText
} from '@chakra-ui/vue'

import { Trivia } from '../../common/trivia'

export default {
  components: {
    CTabs,
    CTabList,
    CTabPanels,
    CTab,
    CTabPanel,
    CBox,
    CHeading,
    CText
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
      scores: {},
      questionCreationStage: 'questionText'
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
          answers: Object.fromEntries(Object.entries(this.trivia.getQuestionResults(q.getName())).map(([k, v]) => [k.replace('_', ' '), v])),
          solution: q.getSolution() === undefined ? undefined : parseInt(q.getSolution())
        }
      ))
    },
    async searchTrivia () {
      if (!this.triviaName) {
        return
      }

      // Reset all values to default
      this.trivia = undefined
      this.possibleAnswers = []
      this.questions = []
      this.isAuthor = false
      this.isCreating = false
      this.loading = true
      this.leaderboardFilter = ''
      this.scores = {}
      this.questionCreationStage = 'questionText'

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
        console.log(this.trivia.getQuestions())
        this.questions = this.parseQuestions(this.trivia.getQuestions())
        console.log(this.questions)
        this.scores = await this.trivia.getScores()
        this.trivia.live((scores, questions, _) => {
          this.questions = this.parseQuestions(questions)
          console.log('Live: ', this.questions)
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
      if (!this.possibleAnswer) {
        return
      }
      this.possibleAnswers.push(this.possibleAnswer)
      this.possibleAnswer = ''
    },
    deleteOption (index) {
      this.possibleAnswers.splice(index, 1)
    },
    createQuestion () {
      if (this.questionName !== '' && this.questionText !== '' && this.possibleAnswers.length > 0) {
        this.questionCreationStage = 'questionText'

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
    sendSolution (answerNumber, questionName) {
      const triviaName = this.triviaName.replace(/\s/g, '_')
      this.composeTweet(`#UniboSWE3 #TriviaGame #${triviaName} #Solution #_${questionName} #S_${answerNumber + 1}`)
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
    },
    insertQuestionText () {
      if (this.questionCreationStage === 'questionText' && this.questionText) {
        this.questionCreationStage = 'options'
      }
    },
    insertOptions () {
      if (this.questionCreationStage === 'options' && this.possibleAnswers.length > 0) {
        this.questionCreationStage = 'questionName'
      }
    }
  }
}

</script>

<style>
  .close {
    background-color: transparent;
    border: none;
  }
  .close:hover {
    background-color: transparent;
    border: none;
  }
</style>
