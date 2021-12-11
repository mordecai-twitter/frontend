import { Contest, User, Voter, Participant } from '../../common/contest'
import Twitter from '../../common/twitter'
import { core } from '../../common/core'

jest.mock('../../common/twitter')
jest.mock('../../common/core')

describe('Test for the contest file', () => {
  describe('Test for the User class', () => {
    let user = {}
    const userID = '1449658830086934530'

    beforeEach(() => {
      user = new User(userID)
    })

    it('getId should return the id passed in the constructor', () => {
      expect(user.getId()).toBe(userID)
    })
  })

  describe('Test for the Participant class', () => {
    let participant = {}
    const participantID = '1449658830086934530'
    const participantProposal = '#_proposaltest'

    beforeEach(() => {
      participant = new Participant(participantID, participantProposal)
    })

    it('getId should return the id passed in the constructor', () => {
      expect(participant.getId()).toBe(participantID)
    })

    it('getProposal should return the proposal passed in the constructor', () => {
      expect(participant.getProposal()).toBe(participantProposal)
    })

    it('getVotes should return 0 if no votes were added', () => {
      expect(participant.getVotes()).toBe(0)
    })

    it('addVote should add a vote, so the next getVotes should return 1', () => {
      participant.addVote()
      expect(participant.getVotes()).toBe(1)
    })

    it('removeVote should remove a vote', () => {
      participant.addVote()
      expect(participant.getVotes()).toBe(1)

      participant.removeVote()
      expect(participant.getVotes()).toBe(0)
    })

    it('removeVote should never make vote count negative', () => {
      participant.removeVote()
      expect(participant.getVotes()).toBe(0)
    })
  })

  describe('Test for the Voter class', () => {
    let voter = {}
    const voterID = '1449658830086934530'

    beforeEach(() => {
      voter = new Voter(voterID)
    })

    it('getId should return the id passed in the constructor', () => {
      expect(voter.getId()).toBe(voterID)
    })

    it('addVote should add a vote a specific participant', () => {
      const participantID = '1249658830086934578'
      const participant = new Participant(participantID, 'proposal test')

      voter.addVote(participant)
      expect(participant.getVotes()).toBe(1)
    })

    it('A voter should never exceed the maximum number of votes', () => {
      const participantID = '1249658830086934578'
      const participant = new Participant(participantID, '#_proposaltest')

      for (let i = 0; i < 15; i += 1) {
        voter.addVote(participant)
      }
      expect(participant.getVotes()).toBe(10)
    })
  })

  describe('Test for the Contest class', () => {
    let contest = {}
    const contestName = 'Nomecontesttest'

    beforeEach(() => {
      contest = new Contest(contestName)
    })

    it('Get votes should return an empty object if no votes were added', () => {
      expect(contest.getVotes()).toEqual({})
    })

    it('Add proposal should add a proposal to the contest, so if getVotes is called it should include the proposal added', () => {
      const proposal1Name = '_propAtest'
      const proposal2Name = '_propBtest'
      const proposal1 = {
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. #UniboSWE3 #Contest #${proposal1Name} #Proposal`,
        author_id: '1449658830086934511'
      }
      const proposal2 = {
        text: `Duis aute irure dolor in reprehenderit . #UniboSWE3 #Contest #${proposal2Name} #Proposal`,
        author_id: '1449658830086934590'
      }
      contest.addProposal(proposal1)
      contest.addProposal(proposal2)

      const expectedVotes = {}
      expectedVotes['#' + proposal1Name] = 0
      expectedVotes['#' + proposal2Name] = 0

      expect(contest.getVotes()).toEqual(expectedVotes)
    })

    it('Add voter should add a vote to a specific proposal, so if getVotes is called it should return the votes of each proposal of the contest', () => {
      const proposal1Name = '_propAtest'
      const proposal2Name = '_propBtest'
      const proposal1 = {
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. #UniboSWE3 #Contest #${proposal1Name} #Proposal`,
        author_id: '1449658830086934511'
      }
      const proposal2 = {
        text: `Duis aute irure dolor in reprehenderit . #UniboSWE3 #Contest #${proposal2Name} #Proposal`,
        author_id: '1449658830086934590'
      }
      contest.addProposal(proposal1)
      contest.addProposal(proposal2)

      contest.addVoter(proposal1)
      contest.addVoter(proposal1)
      contest.addVoter(proposal1)
      contest.addVoter(proposal2)

      const expectedVotes = {}
      expectedVotes['#' + proposal1Name] = 3
      expectedVotes['#' + proposal2Name] = 1

      expect(contest.getVotes()).toEqual(expectedVotes)
    })

    it('fetchVotes should fetch the votes from Twitter Api and add the votes to the contest', async () => {
      const proposal1Name = '_propAtest'
      const proposal2Name = '_propBtest'

      const proposal1 = {
        text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. #UniboSWE3 #Contest #${proposal1Name} #Proposal`,
        author_id: '1449658830086934511'
      }
      const proposal2 = {
        text: `Duis aute irure dolor in reprehenderit . #UniboSWE3 #Contest #${proposal2Name} #Proposal`,
        author_id: '1449658830086934590'
      }
      contest.addProposal(proposal1)
      contest.addProposal(proposal2)

      const mockedResponse = {
        data: [
          {
            id: '1468544542039150592',
            author_id: '1449658830086934590',
            text: `testo test #UniboSWE3 #Contest #${contestName} #${proposal1Name} #Vote`
          },
          {
            id: '1468544533889703940',
            author_id: '1449658830086934589',
            text: `testo test 2222 #UniboSWE3 #Contest #${contestName} #${proposal2Name} #Vote`
          },
          {
            id: '1468544490092867592',
            author_id: '1449658830086934588',
            text: `testo test ciao ciao #UniboSWE3 #Contest #${contestName} #${proposal1Name} #Vote`
          },
          {
            id: '1468544464662798344',
            author_id: '1449658830086934587',
            text: `prova prova #UniboSWE3 #Contest #${contestName} #${proposal1Name} #Vote`
          }
        ],
        meta: {
          newest_id: '1468544542039150592',
          oldest_id: '1468544464662798344',
          result_count: 4,
          next_token: 'b26v89c19zqg8o3fpdy8xphx3ef7t6dub5kyf71sdr2wt'
        }
      }
      Twitter.prototype.contest.mockResolvedValue(mockedResponse)

      const expectedVotes = {}
      expectedVotes['#' + proposal1Name] = 3
      expectedVotes['#' + proposal2Name] = 1

      expect(await contest.fetchVotes()).toEqual(expectedVotes)
    })

    it('fetchProposals should fetch the proposals from Twitter Api and add them to the contest', async () => {
      const proposal1Name = '_propAtest'
      const proposal2Name = '_propBtest'

      const mockedResponse = {
        data: [
          {
            id: '1468544542039150592',
            text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. #UniboSWE3 #Contest #${proposal1Name} #Proposal`,
            author_id: '1449658830086934511'
          },
          {
            id: '1468544533889703940',
            text: `Duis aute irure dolor in reprehenderit . #UniboSWE3 #Contest #${proposal2Name} #Proposal`,
            author_id: '1449658830086934590'
          }
        ],
        meta: {
          newest_id: '1468544542039150592',
          oldest_id: '1468544464662798344',
          result_count: 2,
          next_token: 'b26v89c19zqg8o3fpdy8xphx3ef7t6dub5kyf71sdr2wt'
        }
      }
      Twitter.prototype.contest.mockResolvedValue(mockedResponse)

      await contest.fetchProposals()

      const expectedVotes = {}
      expectedVotes['#' + proposal1Name] = 0
      expectedVotes['#' + proposal2Name] = 0

      expect(contest.getVotes()).toEqual(expectedVotes)
    })

    it('searchContest should search', async () => {
      const mockedResponse = {
        data: [
          {
            id: '1468544542039150592',
            text: 'Primo contest di prova. #UniboSWE3 #Contest #contestA #NewContest',
            author_id: '1449658830086934511'
          },
          {
            id: '1468544533889703940',
            text: 'Secondo contest di prova . #UniboSWE3 #Contest #contestB #NewContest',
            author_id: '1449658830086934590'
          }
        ],
        meta: {
          newest_id: '1468544542039150592',
          oldest_id: '1468544464662798344',
          result_count: 4,
          next_token: 'b26v89c19zqg8o3fpdy8xphx3ef7t6dub5kyf71sdr2wt'
        }
      }
      Twitter.prototype.contest.mockResolvedValue(mockedResponse)
      const data = await Contest.searchContest()

      expect(data).toBe(mockedResponse.data)
    })

    it('Live should call stream Api', () => {
      contest.live()
      expect(core.stream).toHaveBeenCalledTimes(1)
    })

    it('Abort should call stream abort Api', () => {
      contest.abort()
      expect(core.abortStream).toHaveBeenCalledTimes(1)
    })
  })
})
