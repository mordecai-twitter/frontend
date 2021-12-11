/* eslint-disable node/no-callback-literal */

import flushPromises from 'flush-promises'
import Page from '../../pages/Tweets/index.vue'
import { getMountedWrappedPage } from '../helper/helper'
import Data from '../helper/data.js'
import Assert from '../helper/assertion'
import { core, Paginator } from '../../common/core'

jest.mock('axios', () => {
  const mAxiosInstance = { get: jest.fn() }
  return {
    create: jest.fn(() => mAxiosInstance)
  }
})
jest.mock('../../common/core')

describe('Test for the page showing all tweets', () => {
  const mock = {}

  beforeEach(() => {
    mock.wrapper = getMountedWrappedPage(Page)
    mock.textInputKeyword = mock.wrapper.find('#textInputKeyword')
    mock.searchButton = mock.wrapper.find('#searchButton')
    mock.tweetsContainer = mock.wrapper.find('#tweetsContainer')
    mock.streamButton = mock.wrapper.find('#streamButton')
    mock.abortButton = mock.wrapper.find('#abortButton')
    mock.olderButton = mock.wrapper.find('#olderButton')
    mock.recentButton = mock.wrapper.find('#recentButton')
    mock.tweets = Data.getTweetsData()
  })

  describe('Preliminary test', () => {
    test('The text input should exists', () => {
      Assert.componentExistance(mock.textInputKeyword)
    })

    test('The tweets container should exists', () => {
      Assert.componentExistance(mock.tweetsContainer)
    })

    test('The search button should exists', () => {
      Assert.componentExistance(mock.searchButton)
    })

    test('The stream button should exists and abort button should not exists', () => {
      Assert.componentExistance(mock.streamButton)
      expect(mock.abortButton.exists()).toBe(false)
    })

    test('The older and recent button should exists at beginning', () => {
      expect(mock.olderButton.exists()).toBe(false)
      expect(mock.recentButton.exists()).toBe(false)
    })
  })

  describe('Test for the user stories', () => {
    test('Stream, if user click on stream, core Stream should be called', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      await mock.streamButton.trigger('click')
      await flushPromises()

      expect(core.stream).toHaveBeenCalled()
    })

    test('Stream, if user click on abort, core abortStream should be called', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      core.stream.mockImplementation((query, callback) => {
        callback({
          id: 'id'
        })
      })
      await mock.streamButton.trigger('click')
      await flushPromises()

      mock.abortButton = mock.wrapper.find('#abortButton')
      await mock.abortButton.trigger('click')
      await flushPromises()

      expect(core.abortStream).toHaveBeenCalled()
    })

    test('If user click on search the core.search should be called, along with sentiment e termcloud', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      core.search.mockResolvedValue({ getTweets () { return [] } })
      await mock.searchButton.trigger('click')
      await flushPromises()

      expect(core.search).toHaveBeenCalled()
      expect(core.sentiment).toHaveBeenCalled()
      expect(core.termcloud).toHaveBeenCalled()
    })

    test('If user click on search the core.search should be called, along with sentiment e termcloud', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      core.search.mockResolvedValue({ getTweets () { return [] } })
      await mock.searchButton.trigger('click')
      await flushPromises()

      expect(core.search).toHaveBeenCalled()
      expect(core.sentiment).toHaveBeenCalled()
      expect(core.termcloud).toHaveBeenCalled()
    })

    test('Termcloud should appear when a search is made', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      core.search.mockResolvedValue({ getTweets () { return [] } })
      core.sentiment.mockResolvedValue({
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
        neutralCount: 47,
        chartdata: [10, 20, 30]
      })
      core.termcloud.mockResolvedValue([['parola1', 50], ['parola2', 25], ['parola3', 10]])
      await mock.searchButton.trigger('click')
      await flushPromises()

      const termcloudWrapper = mock.wrapper.find('#term-cloud-wrap')
      Assert.componentExistance(termcloudWrapper)
    })

    test('Sentimental chart should appear when a search is made', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)
      core.search.mockResolvedValue({ getTweets () { return [] } })
      core.sentiment.mockResolvedValue({
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
        neutralCount: 47,
        chartdata: [10, 20, 30]
      })
      core.termcloud.mockResolvedValue([['parola1', 50], ['parola2', 25], ['parola3', 10]])
      await mock.searchButton.trigger('click')
      await flushPromises()

      const sentimentChart = mock.wrapper.find('#sentimentContainer')
      Assert.componentExistance(sentimentChart)
    })

    test('Clicking on older or recent button should make core request', async () => {
      const query = '#MotoGp'

      await mock.textInputKeyword.setValue(query)

      core.search.mockResolvedValue(new Paginator())
      Paginator.prototype.getTweets.mockReturnValue([{ id: '1469641961569079306' }, { id: '1469641961569079307' }, { id: '1469641961569079308' }])

      await mock.searchButton.trigger('click')
      await flushPromises()

      mock.olderButton = mock.wrapper.find('#olderButton')
      Assert.componentExistance(mock.olderButton)

      core.search.mockResolvedValue(new Paginator())
      Paginator.prototype.getTweets.mockReturnValue([{ id: '1469641961569079303' }, { id: '1469641961569079304' }, { id: '1469641961569079305' }])
      Paginator.prototype.next.mockReturnValue(2)

      await mock.olderButton.trigger('click')
      await flushPromises()

      expect(Paginator.prototype.next).toHaveBeenCalledTimes(1)

      mock.recentButton = mock.wrapper.find('#recentButton')
      Assert.componentExistance(mock.recentButton)

      core.search.mockResolvedValue(new Paginator())
      Paginator.prototype.getTweets.mockReturnValue([{ id: '1469641961569079303' }, { id: '1469641961569079304' }, { id: '1469641961569079305' }])
      Paginator.prototype.prev.mockReturnValue(1)

      await mock.recentButton.trigger('click')
      await flushPromises()

      expect(Paginator.prototype.prev).toHaveBeenCalledTimes(1)
    })
  })
})
