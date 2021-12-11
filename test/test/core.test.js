import { core, Paginator } from '../../common/core'
import Twitter from '../../common/twitter'

jest.mock('../../common/twitter')

describe('Test for the Core class', () => {
  it('termcloud should return an array made of array where the first value is a string and the second is a number', async () => {
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

  it('sentiment should return an array made of array where the first value is a string and the second is a number', async () => {
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

  describe('Test for Search methods', () => {
    it('Search should make a search request to the Twitter api class', async () => {
      const query = 'novax'
      await core.search(query)
      expect(Twitter.prototype.search).toHaveBeenCalledTimes(1)
    })

    it('Search should return a Paginator Object', async () => {
      const query = 'novax'
      const mockedResponse = {
        data:
        [
          { id: '1467795847803027459', text: '@ProfCampagna Il fatto che lei mi identifichi come novax o che abbia bisogno di etichette da attaccare al prossimo, racconta molto di come lei legga la realtà in modo superficiale e distorto.' },
          { id: '1467795837023567877', text: 'RT @ladyonorato: I vaccinati m, non i #novax sono scesi in piazza a manifestare, stavolta. Chissà perché nessuno ne ha parlato.' },
          { id: '1467795832686718979', text: "RT @mrk4m1: Dovete capire che il green pass non è una misura sanitaria, o contro i novax.\n\nÈ un'idea. L'idea che lo Stato possa decidere un…" }
        ],
        meta: { newest_id: '1467795847803027459', oldest_id: '1467795755847008257', result_count: 10, next_token: 'b26v89c19zqg8o3fpdy8io6xgohbquggfy406k15i0vwd' }
      }

      Twitter.prototype.search.mockResolvedValue(mockedResponse)

      const response = await core.search(query)
      expect(response).toBeInstanceOf(Paginator)
    })
  })

  describe('Test for Single tweet methods', () => {
    it('Single Tweet should make a search single Tweet request to the Twitter api class', async () => {
      const query = '1467795847803027459'
      await core.singleTweet(query)
      expect(Twitter.prototype.singleTweet).toHaveBeenCalledTimes(1)
    })

    it('Single tweet should return a single tweet ', async () => {
      const query = '1467795847803027459'
      const mockedResponse = { id: '1467795847803027459', text: '@ProfCampagna Il fatto che lei mi identifichi come novax o che abbia bisogno di etichette da attaccare al prossimo, racconta molto di come lei legga la realtà in modo superficiale e distorto.' }
      Twitter.prototype.singleTweet.mockResolvedValue(mockedResponse)

      const reponse = await core.singleTweet(query)
      expect(reponse).toEqual(mockedResponse)
    })
  })

  describe('Test for dayTweetCount methods', () => {
    it('dayTweetCount should make a countTweets request to the Twitter api class', async () => {
      const query = 'novax'
      const day = 'Thu Apr 12 2018'

      // To avoid error, since dayTweetCount access the .data propriety of the response
      const mockedResponse = { data: {} }
      Twitter.prototype.countTweets.mockResolvedValue(mockedResponse)

      await core.dayTweetCount(query, day)
      expect(Twitter.prototype.countTweets).toHaveBeenCalledTimes(1)
    })

    it('dayTweetCount should return the information about tweet count in a particular day', async () => {
      const query = 'novax'
      const day = 'Thu Apr 12 2018'
      const dayAfter = 'Fry Apr 13 2018'

      const mockedResponse = {
        data: {
          end: new Date(dayAfter),
          start: new Date(day),
          count: 200
        }
      }
      Twitter.prototype.countTweets.mockResolvedValue(mockedResponse)
      const response = await core.dayTweetCount(query, 'Thu Apr 12 2018')
      expect(response).toEqual(mockedResponse.data)
    })
  })

  describe('Test for GetUserInfo methods', () => {
    it('GetUserInfo should make a userById request to the Twitter api class', async () => {
      const userID = '1449658830086934530'

      await core.getUserInfo(userID)
      expect(Twitter.prototype.userById).toHaveBeenCalledTimes(1)
    })

    it('dayTweetCount should return the information about tweet count in a particular day', async () => {
      const userID = '1449658830086934530'

      const mockedResponse = {
        data: {
          id: '1449658830086934530',
          name: 'Bobby Moore',
          username: 'BobbyMo24291328'
        }
      }
      Twitter.prototype.userById.mockResolvedValue(mockedResponse)
      const response = await core.getUserInfo(userID)
      expect(response).toEqual(mockedResponse)
    })
  })

  describe('Test for getGeo methods', () => {
    it('getGeo should make a geoId request to the Twitter api class', async () => {
      const geoID = '0a63908f39d63000'

      // To avoid error, since dayTweetCount access the .data propriety of the response
      const mockedResponse = {
        centroid: {}
      }
      Twitter.prototype.geoId.mockResolvedValue(mockedResponse)

      await core.getGeo(geoID)
      expect(Twitter.prototype.geoId).toHaveBeenCalledTimes(1)
    })

    it('getGeo should return the information about tweet count in a particular day', async () => {
      const geoID = '0a63908f39d63000'

      const mockedResponse = {
        id: '0a63908f39d63000',
        name: 'Palazzo Paleotti',
        full_name: 'Palazzo Paleotti',
        country: 'Italy',
        country_code: 'IT',
        url: 'https://api.twitter.com/1.1/geo/id/0a63908f39d63000.json',
        place_type: 'poi',
        attributes: {},
        bounding_box: { type: 'Polygon', coordinates: [[Array]] },
        centroid: [11.351211788188555, 44.49641881503944],
        contained_within: [
          {
            id: '50e28e667e551e9f',
            name: '40126',
            full_name: '40126',
            country: 'Italy',
            country_code: 'IT',
            url: 'https://api.twitter.com/1.1/geo/id/50e28e667e551e9f.json',
            place_type: 'admin',
            attributes: {},
            bounding_box: [Object],
            centroid: [Array]
          }
        ],
        polylines: [],
        geometry: {
          type: 'Point',
          coordinates: [11.351211788188555, 44.49641881503944]
        },
        vendor_info: { foursquare: {} }
      }
      Twitter.prototype.geoId.mockResolvedValue(mockedResponse)
      const response = await core.getGeo(geoID)
      expect(response).toEqual(mockedResponse.centroid)
    })
  })

  describe('Test for stream methods', () => {
    it('stream should make a stream request to the Twitter api class', async () => {
      await core.stream()
      expect(Twitter.prototype.stream).toHaveBeenCalledTimes(1)
    })
  })
})
