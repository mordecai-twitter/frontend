<template>
  <c-box id="wrapper" m="2em" mt="4em">
    <c-input variant="flushed" v-model="contestName" type="text" placeholder="Insert here your contest name" />
    <c-stack :spacing="5" is-inline align="center" justify="center">
      <c-button variant-color="black" type="button" name="button" @click="searchContest()">Search</c-button>
      <c-button variant-color="black" type="button" name="button" @click="createContest()">Create</c-button>
    </c-stack>
    <c-box v-if="this.contest">
      <c-heading>Contest: {{ this.contest.name }}</c-heading>
      <c-input variant="flushed" v-model="proposalName" placeholder="Proposal name"></c-input>
      <c-button variant-color="black" @click="createProposal()">Create proposal</c-button>
      <c-box v-for="vote in votes" :key="vote">
        <c-text>{{vote.name}}: {{vote.count}}</c-text>
        <c-button variant-color="black" @click="createVote(vote.name)">Vote</c-button>
      </c-box>
      <VotesChart v-if="votes" v-bind:votes="votes" />
    </c-box>
  </c-box>
</template>

<script>
import { Contest } from '../../common/contest'
import VotesChart from '../../components/VotesChart'

export default {
  components: {
    VotesChart
  },
  data () {
    return {
      contest: undefined,
      contestName: '',
      proposalName: '',
      dialogClosed: false,
      votes: []
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
    createContest () {
      const contestName = this.contestName.replace(/ /g, '_')
      this.composeTweet(`#UniboSWE3 #Contest #${contestName} #NewContest`, 'New Contest',
        () => {
          this.searchContest()
        }
      )
    },
    parseVotes (votes) {
      console.log(votes)
      return Object.entries(votes)
        .map(([key, value]) => ({ name: key.substring(2).replace(/_/g, ' '), count: value }))
        .sort((a, b) => b.count - a.count)
    },
    async searchContest () {
      if ((await Contest.searchContest(this.contestName)).length === 0) {
        console.log('Contest not found')
      } else {
        this.contest = new Contest(this.contestName)
        await this.contest.fetchProposals()
        this.votes = this.parseVotes(await this.contest.fetchVotes())
        console.log('TEST')
        this.contest.live((votes) => {
          this.votes = this.parseVotes(votes)
        })
      }
    },
    createProposal () {
      const contestName = this.contestName.replace(/ /g, '_')
      const proposalName = this.proposalName.replace(/ /g, '_')
      this.composeTweet(`#UniboSWE3 #Contest #${contestName} #Proposal #_${proposalName}`, 'New Proposal')
    },
    createVote (voteName) {
      const contestName = this.contestName.replace(/ /g, '_')
      voteName = voteName.replace(/ /g, '_')
      this.composeTweet(`#UniboSWE3 #Contest #${contestName} #Vote #_${voteName}`, 'New Vote')
    }
  }
}

</script>
