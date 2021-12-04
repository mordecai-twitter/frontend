import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'
import { core } from './core'

class Contest {
  constructor (name) {
    this.name = name

    this.partecipants = {}
    this.voters = {}
    this.api = new Twitter()
    this.isStreaming = false
  }

  getVotes () {
    const votes = {}
    console.log(this.partecipants)
    for (const partecipant of Object.values(this.partecipants)) {
      votes[partecipant.getProposal()] = partecipant.getVotes()
    }
    return votes
  }

  async fetchProposal () {
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
    const proposalName = proposal.text.match(/#_[A-Za-z]*/g)[0]
    if (!this.partecipants[proposalName]) {
      this.partecipants[proposalName] = new Partecipant(proposal.author_id, proposalName)
    }
  }

  addVoter (proposal) {
    const proposalName = proposal.text.match(/#_[A-Za-z]*/g)[0]
    if (!this.voters[proposal.author_id]) {
      this.voters[proposal.author_id] = new Voter(proposal.author_id)
    }
    this.voters[proposal.author_id].addVote(this.partecipants[proposalName])
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
    this.api.stream(query, (tweet) => {
      tweet.author_id = tweet.user.id_str
      this.isStreaming = true
      const isVote = tweet.text.match(/#(v|V)ote/g)
      const isProposal = tweet.text.match(/#(p|P)roposal/g)
      if (isVote) {
        console.log('Is vote')
        this.addVoter(tweet)
      } else if (isProposal) {
        console.log('Is proposal')
        this.addProposal(tweet)
      }
      callback(this.getVotes())
    }, () => {
      this.isStreaming = false
    })
  }

  abort () {
    this.isStreaming = false
    core.abortStream()
  }

  async init () {
    await this.fetchProposal()
    await this.fetchVotes()
    console.log(this.partecipants)
    console.log(this.voters)
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

  addVote (partecipant) {
    if (this.votes.length >= 10) {
      const removed = this.votes.pop()
      removed.removeVote()
    }
    partecipant.addVote()
    this.votes.unshift(partecipant)
  }
}

class Partecipant extends User {
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
