import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'
import { core } from './core'

class Contest {
  constructor (name) {
    this.name = name

    this.participants = {}
    this.voters = {}
    this.api = new Twitter()
    this.isStreaming = false
  }

  getVotes () {
    const votes = {}
    for (const participant of Object.values(this.participants)) {
      votes[participant.getProposal()] = participant.getVotes()
    }
    return votes
  }

  static async searchContest (name) {
    const keyword = `#UniboSWE3 #Contest #${name} #NewContest`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeContestQuery(keyword).get()
    const res = await (new Twitter()).contest(query)
    return res.data
  }

  async fetchProposals () {
    const keyword = `#UniboSWE3 #Contest #${this.name} #Proposal`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeContestQuery(keyword).get()
    const res = await this.api.contest(query)
    const proposals = res.data
    for (const proposal of proposals) {
      this.addProposal(proposal)
    }
  }

  addProposal (proposal) {
    const proposalName = proposal.text.match(/#_[A-Za-z_]*/g)[0]
    if (!this.participants[proposalName]) {
      this.participants[proposalName] = new Participant(proposal.author_id, proposalName)
    }
  }

  addVoter (proposal) {
    const proposalName = proposal.text.match(/#_[A-Za-z_]*/g)[0]
    if (!this.voters[proposal.author_id]) {
      this.voters[proposal.author_id] = new Voter(proposal.author_id)
    }
    // TODO: Allow voters to vote non-proposed books
    this.voters[proposal.author_id]?.addVote(this.participants[proposalName])
  }

  async fetchVotes () {
    // #uniboswe3 #contest #Nomecontest #vote #_nomeproposalvoted
    const keyword = `#UniboSWE3 #Contest #${this.name} #Vote`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeContestQuery(keyword).get()
    const res = await this.api.contest(query)
    // Proposal loading
    const proposals = res.data.reverse()
    for (const proposal of proposals) {
      // #uniboswe3 #contest #nomeContest #Proposal #nomePrposta
      this.addVoter(proposal)
    }

    return this.getVotes()
  }

  /**
  * @summary Go live with the contest.
  * @param {Object} votes - Real time votes to update
  *
  */
  live (callback) {
    const keyword = `#UniboSWE3 #Contest #${this.name}`
    const query = {}
    query.keywords = keyword
    core.stream(query, (tweet) => {
      tweet.author_id = tweet.user.id_str
      this.isStreaming = true
      const isVote = tweet.text.match(/#(v|V)ote/g)
      const isProposal = tweet.text.match(/#(p|P)roposal/g)
      if (isVote) {
        this.addVoter(tweet)
      } else if (isProposal) {
        this.addProposal(tweet)
      }
      console.log(this.voters)
      callback(this.getVotes(), this.participants)
    }, () => {
      this.isStreaming = false
    })
    // OLD CODE
    // this.api.stream(query, (tweet) => {
    //   tweet.author_id = tweet.user.id_str
    //   this.isStreaming = true
    //   const isVote = tweet.text.match(/#(v|V)ote/g)
    //   const isProposal = tweet.text.match(/#(p|P)roposal/g)
    //   if (isVote) {
    //     this.addVoter(tweet)
    //   } else if (isProposal) {
    //     this.addProposal(tweet)
    //   }
    //   console.log(this.voters)
    //   callback(this.getVotes(), this.participants)
    // }, () => {
    //   this.isStreaming = false
    // })
  }

  abort () {
    this.isStreaming = false
    core.abortStream()
  }

  async init () {
    await this.fetchProposals()
    await this.fetchVotes()
  }
}

class User {
  constructor (id) {
    this.id = id
  }

  getId () {
    return this.id
  }

  getContest () {
    return this.contest
  }
}

class Voter extends User {
  constructor (id) {
    super(id)
    this.votes = []
  }

  addVote (participant) {
    if (participant) {
      if (this.votes.length >= 10) {
        const removed = this.votes.pop()
        removed.removeVote()
      }
      participant.addVote()
      this.votes.unshift(participant)
    }
  }
}

class Participant extends User {
  constructor (id, proposal) {
    super(id)
    this.proposal = proposal
    this.votes = 0
  }

  getVotes () {
    return this.votes
  }

  getProposal () {
    return this.proposal
  }

  addVote () {
    this.votes = this.votes + 1
  }

  removeVote () {
    this.votes = this.votes - 1
  }
}

export { Contest }
