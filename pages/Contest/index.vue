<template>
  <c-box id="wrapper" m="2em" mt="4em">
    <c-input variant="flushed" v-model="contestName" v-on:keyup.enter="searchContest()" type="text" placeholder="Insert here your contest name" />
    <c-stack :spacing="5" is-inline align="center" justify="center">
      <c-button :isDisabled="!this.contestName" variant-color="black" type="button" name="button" @click="searchContest()">Search</c-button>
      <c-button :isDisabled="!this.contestName" variant-color="black" type="button" name="button" @click="createContest()">Create</c-button>
    </c-stack>
    <c-box v-if="this.contest">
      <c-heading>Contest: {{ this.contest.name }}</c-heading>
      <c-input variant="flushed" v-model="proposalName" v-on:keyup.enter="createProposal()" placeholder="Proposal name"></c-input>
      <c-button variant-color="black" @click="createProposal()" :isDisabled="!this.proposalName">Add proposal</c-button>
      <c-flex>
        <c-box id="votes" w="30em">
          <c-box
          v-for="vote in votes"
          :key="vote.name"
          @click="createVote(vote.name)"
          border="1px"
          m="1em"
          p="1em"
          class="contestOption"
          >
            <c-flex class="vote">
              <c-flex justify="center" align="center">
                <c-text pr="1em">{{vote.name}} </c-text>
              </c-flex>
              <c-tag variantColor="vue">votes: {{vote.count}}</c-tag>
            </c-flex>
          </c-box>
        </c-box>
        <c-box w="30em" h="30em" pl="2em" v-if="votes">
          <VotesChart v-bind:votes="votes"/>
        </c-box>
      </c-flex>
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
      if (this.contestName !== '') {
        this.composeTweet(`#UniboSWE3 #Contest #${contestName} #NewContest`, 'New Contest',
          () => {
            // TODO: ha senso subito dopo aver creato il contest, cercarlo? (Problema: Utente non inserisce nome contest)
            // this.searchContest()
          }
        )
      }
    },
    parseVotes (votes) {
      console.log(votes)
      return Object.entries(votes)
        .map(([key, value]) => ({ name: key.substring(2).replace(/_/g, ' '), count: value }))
        .sort((a, b) => b.count - a.count)
    },
    async searchContest () {
      if (this.contest) {
        this.contest.abort()
      }
      if (this.contestName === '' || (await Contest.searchContest(this.contestName)).length === 0) {
        // TODO: Inserire un modal che notifica l'utente
        alert('Contest not found')
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
      if (this.proposalName !== '') {
        const contestName = this.contestName.replace(/ /g, '_')
        const proposalName = this.proposalName.replace(/ /g, '_')
        this.composeTweet(`#UniboSWE3 #Contest #${contestName} #Proposal #_${proposalName}`, 'New Proposal')
      }
    },
    createVote (voteName) {
      const contestName = this.contestName.replace(/ /g, '_')
      voteName = voteName.replace(/ /g, '_')
      this.composeTweet(`#UniboSWE3 #Contest #${contestName} #Vote #_${voteName}`, 'New Vote')
    }
  }
}

</script>

<style>
  .contestOption:hover {
    background-color: cadetblue;
    cursor: pointer;
  }
  #votes {
    overflow: auto;
    height: 30em
  }
  .vote {
    justify-content: space-between;
  }
</style>
