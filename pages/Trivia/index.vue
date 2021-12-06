<template>
  <c-box id="wrapper" m="2em" mt="4em">
    <c-input variant="flushed" v-model="triviaName" type="text" placeholder="Insert here your trivia name" />
    <c-stack :spacing="5" is-inline align="center" justify="center">
      <c-button variant-color="black" type="button" name="button" @click="searchTrivia()">Search</c-button>
      <c-button variant-color="black" type="button" name="button" @click="createTrivia()">Create</c-button>
    </c-stack>
    <c-box v-if="this.trivia">
      <c-heading>Trivia: {{ this.trivia.name }}</c-heading>
      <c-box v-if="isAuthor">
        <c-input variant="flushed" v-model="questionName" placeholder="Insert here the question name"></c-input>
        <c-input variant="flushed" v-model="questionText" placeholder="Insert here the question text"></c-input>
        <c-input variant="flushed" v-model="possibleAnswer" placeholder="Insert here possible answer"></c-input>
        <c-button variant-color="black" @click="insertPossibleAnswer()">Insert possible answer</c-button>
        <c-button variant-color="black" @click="createQuestion()">Create Question</c-button>
      </c-box>
      <c-box v-else>
        <c-heading>Questions</c-heading>
        <c-box v-for="question in questions" :key="question">
          <c-heading as="h4" size="sm">{{ question.text }}</c-heading>
          <c-box v-for="(answer, index, a) in question.answers" :key="answer">
            <c-text>{{ index }} . {{ answer }} . {{ a }}</c-text>
            <c-button variant-color="blue" @click="sendAnswer(index, question.name)">Choose Answer</c-button>
          </c-box>
        </c-box>
      </c-box>
    </c-box>
  </c-box>
</template>

<script>

export default {
  components: {

  },
  data () {
    return {
      triviaName: '',
      questionText: '',
      questionName: '',
      trivia: {},
      possibleAnswers: [],
      questions: [{
        text: 'what color is the sky?',
        name: 'sky',
        answers: ['blue', 'red', 'green', 'yellow']
      },
      {
        text: 'what color is your mom?',
        name: 'mom',
        answers: ['blue', 'red', 'green', 'yellow']
      }],
      isAuthor: false,
      isCreating: false
    }
  },
  methods: {
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
    searchTrivia () {
      // TODO: Actually search trivia
      this.trivia = {}
    },
    createTrivia () {
      // TODO: Check if trivia exists
      const triviaName = this.triviaName.replace(/\s/g, '_')
      this.composeTweet(`#UniboSWE3 #TriviaGame #New #${triviaName}`, 'New Trivia', () => {
        // TODO: Check if trivia was created
        this.trivia = {}
      })
    },
    insertPossibleAnswer () {
      this.possibleAnswers.push(this.possibleAnswer)
      this.possibleAnswer = ''
    },
    sendAnswer (answerNumber, questionName) {
      const triviaName = this.triviaName.replace(/\s/g, '_')
      this.composeTweet(`#UniboSWE3 #TriviaGame ${triviaName} #Answer #A${questionName} #${answerNumber}`)
    }
  }
}

</script>
