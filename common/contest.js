import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'

class Contest {
  constructor (name) {
    this.name = name
    this.partecipants = {}
    this.voters = {}
    this.api = new Twitter()
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
      const proposalName = proposal.text.match(/#_[A-Za-z]*/g)[0]
      if (!this.partecipants[proposalName]) {
        this.partecipants[proposalName] = new Partecipant(proposal.author_id, proposalName)
      }
    }
    console.log(this.partecipants)
  }

  async fetchVotes () {
    // #uniboswe3 #contest #Nomecontest #vote #_nomeproposalvoted
    const keyword = `#UniboSWE3 #Contest #${this.name} #Vote`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeContestQuery(keyword).get()
    const res = await this.api.contest(query)
    // Proposal loading
    const proposals = res.data
    for (const proposal of proposals) {
      // #uniboswe3 #contest #nomeContest #Proposal #nomePrposta
      const proposalName = proposal.text.match(/#_[A-Za-z]*/g)[0]
      if (!this.voters[proposal.author_id]) {
        this.voters[proposal.author_id] = new Voter(proposal.author_id)
      }
      this.voters[proposal.author_id].addVote(this.partecipants[proposalName])
    }
  }

  async init () {
    await this.fetchProposal()
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

  addVote (partecipant) {
    if (this.votes.length < 10) {
      this.votes.unshift(partecipant)
      partecipant.addVote()
    }
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
    console.log('removing:', this.votes)
  }
}

export { Contest }
