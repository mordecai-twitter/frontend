import { core } from '../../common/core'
import Twitter from '../../common/twitter'

jest.mock('../../common/twitter')

describe('Test for the Core class', () => {
  it('Search should make an api request to a specific url, passing the given query', () => {
  })

  it('/termcloud should return an array made of array where the first value is a string and the second is a number', async () => {
    const query = 'novax'
    const mockedResponse = [{ word: 'novax', freq: 50 }, { word: '#novax', freq: 35 }, { word: 'vaccini', freq: 25 }]
    Twitter.prototype.termcloud.mockResolvedValue(mockedResponse)

    const response = await core.termcloud(query)

    expect(response).toBeInstanceOf(Array)
    response.forEach((item, index) => {
      expect(item).toBeInstanceOf(Array)
      expect(item[0]).toBe(mockedResponse[index].word)
      expect(item[1]).toBe(mockedResponse[index].freq)
    })
  })

  it('/sentiment should return an array made of array where the first value is a string and the second is a number', async () => {
    const query = 'novax'
    const mockedResponse = {
      score: 0,
      comparative: -0.12343137254901955,
      best: {
        score: 8,
        tweet: {
          id: '1467568358962999296',
          lang: 'it',
          text: "RT @51_seal: Al Tg4 è stato assegnato il premio Seminatore d'odio 2021, per la mole di fango riservata ai novax rei di avere legittimi dubb…"
        }
      },
      worst: {
        score: -7,
        tweet: {
          id: '1467568582028632074',
          lang: 'it',
          text: '@LaStampa Quando la gente viene discriminata, bullizzata, demonizzata, insultata, emarginata, odiata, crocifissa, bersagliata, oppressa...Cosa succede di solito? Cosa ci ha insegnato la storia? ⛔ LA GUERRA. #ObbligoVaccinale #NoGreenPass #supergreenpass #Crisanti #Draghi #novax #greenpass https://t.co/9i713UuCWf'
        }
      },
      positiveCount: 22,
      negativeCount: 33,
      neutralCount: 47
    }
    Twitter.prototype.sentiment.mockResolvedValue(mockedResponse)
    const response = await core.sentiment(query)
    expect(response).toEqual(mockedResponse)
  })
})
