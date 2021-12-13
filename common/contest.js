/**
 * @file In this file is implemented a contest management by twitter
 * @author Antonio Lopez, Andrea Zecca, Samuele Marro
 */

import Twitter from './twitter'
import { QueryDirector, V2Builder } from './query'
import { core } from './core'

/**
* @class Contest
* Manage a contest using twitter.
*/
class Contest {
  constructor (name) {
    this.name = name

    this.participants = {}
    this.voters = {}
    this.api = new Twitter()
    this.isStreaming = false
  }

  /**
  * @summary Get the votes for each proposal
  *
  * @return {Object} - { proposal: votes}
  */
  getVotes () {
    const votes = {}
    for (const participant of Object.values(this.participants)) {
      votes[participant.getProposal()] = participant.getVotes()
    }
    return votes
  }

  /**
  * @summary Search if a contest exists
  * @param {string} name - Name of the contest
  *
  * @return {Object} - Contest tweet creation
  */
  static async searchContest (name) {
    const keyword = `#UniboSWE3 #Contest #${name} #NewContest`
    const director = new QueryDirector(new V2Builder())
    const query = director.makeContestQuery(keyword).get()
    const res = await (new Twitter()).contest(query)
    return res.data
  }

  /**
  * @summary Load all the proposal for the contest
  *
  */
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

  /**
  * @summary Add a new proposal
  * @param {Object} proposal - New proposal
  *
  */
  addProposal (proposal) {
    const proposalName = proposal.text.match(/#_[A-Za-z_]*/g)[0]
    if (!this.participants[proposalName]) {
      this.participants[proposalName] = new Participant(proposal.author_id, proposalName)
    }
  }

  /**
  * @summary Add a new voter
  * @param {Object} proposal - Proposal voted
  *
  */
  addVoter (proposal) {
    const proposalName = proposal.text.match(/#_[A-Za-z_]*/g)[0]
    if (!this.voters[proposal.author_id]) {
      this.voters[proposal.author_id] = new Voter(proposal.author_id)
    }
    this.voters[proposal.author_id]?.addVote(this.participants[proposalName])
  }

  /**
  * @summary Fetch votes and voters
  *
  */
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
      callback(this.getVotes())
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

  /**
  * @summary Abort the live contest
  *
  */
  abort () {
    this.isStreaming = false
    core.abortStream()
  }

  /**
  * @summary Initialize the contest
  *
  */
  async init () {
    await this.fetchProposals()
    await this.fetchVotes()
  }
}

/**
* @class User class
*
*/
class User {
  constructor (id) {
    this.id = id
  }

  /**
  * @summary Get user id
  *
  * @return {string} id of the user
  */
  getId () {
    return this.id
  }
}

/**
* @class Voter class
*
* This class contains information about a voter
*/
class Voter extends User {
  constructor (id) {
    super(id)
    this.votes = []
  }

  /**
  * @summary Add a vote to the given partecipant
  * @param {Participant} partecipant - Partecipant voted
  */
  addVote (partecipant) {
    if (partecipant) {
      if (this.votes.length >= 10) {
        const removed = this.votes.pop()
        removed.removeVote()
      }
      partecipant.addVote()
      this.votes.unshift(partecipant)
    }
  }
}

/**
* @class Partecipant class
*
* This class contains information a partecipant and his proposal
*/
class Participant extends User {
  constructor (id, proposal) {
    super(id)
    this.proposal = proposal
    this.votes = 0
  }

  /**
  * @summary Get votes of the proposal
  */
  getVotes () {
    return this.votes
  }

  /**
  * @summary Get proposal
  */
  getProposal () {
    return this.proposal
  }

  /**
  * @summary Add a vote to the proposal
  */
  addVote () {
    this.votes = this.votes + 1
  }

  /**
  * @summary Remove a vote to the proposal
  */
  removeVote () {
    this.votes = this.votes - 1
  }
}

export { Contest, User, Voter, Participant }
