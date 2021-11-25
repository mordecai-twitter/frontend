import flushPromises from 'flush-promises'
import Page from '../../pages/Tweets/index.vue'
import { getMountedWrappedPage, randomlyInsertString, simulateSearchQuery } from '../helper/helper'
import Data from '../helper/data.js'
import mockedAxios from '../mocks/axios'
import Assert from '../helper/assertion'
import Tweet from '../../components/Tweet.vue'
import { core } from '../../common/core'

const mock = {}
jest.mock('axios', () => {
  const mAxiosInstance = { get: jest.fn() }
  return {
    create: jest.fn(() => mAxiosInstance)
  }
})

describe('Test for the page showing all tweets', () => {
  beforeEach(() => {
    mock.wrapper = getMountedWrappedPage(Page)
    mock.searchSelect = mock.wrapper.find('#searchTypesSelect')
    mock.searchSelectOption = {
      user: mock.wrapper.find('#searchTypesSelect option[value=\'user\']'),
      keyword: mock.wrapper.find('#searchTypesSelect option[value=\'keyword\']')
    }
    mock.textInput = mock.wrapper.find('#textInput')
    mock.goButton = mock.wrapper.find('#searchButton')
    mock.tweetsContainer = mock.wrapper.find('#tweetsContainer')

    mock.tweets = Data.getTweetsData()

    // Mocca la funzione sentiment di core, perché non vogliamo testarla adesso
    core.sentiment = jest.fn()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Preliminary test', () => {
    test('The search select should exists', () => {
      Assert.componentExistance(mock.searchSelect)
    })

    test('The search select option should exists', () => {
      Assert.componentExistance(mock.searchSelectOption.user)
      Assert.componentExistance(mock.searchSelectOption.keyword)
    })

    test('The text input should exists', () => {
      Assert.componentExistance(mock.textInput)
    })

    test('The tweets container should exists', () => {
      Assert.componentExistance(mock.tweetsContainer)
    })
  })

  describe('Testing the search', () => {
    test('It should display tweet containing the hashtag of the query', async () => {
      const query = '#MotoGp'

      // Aggiungo in mezzo al testo dei tweets il testo della query
      mock.tweets.statuses.forEach((tweet) => {
        tweet.text = randomlyInsertString(tweet.text, query)
      })

      simulateSearchQuery(mock, query, mock.tweets, mock.searchSelectOption.keyword)
      // Attendo il risultato
      await flushPromises()

      // Mi aspetto che tutti i tweets contengano nel loro testo la query
      const childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToContainValue(childrens, query, prop => prop.tweet.text)
    })

    test('It should display tweet containing the queried text', async () => {
      const query = 'random text'

      // Aggiungo in mezzo al testo dei tweets il testo della query
      mock.tweets.statuses.forEach((tweet) => {
        tweet.text = randomlyInsertString(tweet.text, query)
      })

      simulateSearchQuery(mock, query, mock.tweets, mock.searchSelectOption.keyword)
      await flushPromises()

      // Mi aspetto che tutti i tweets contengano nel loro testo la query
      const childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToContainValue(childrens, query, prop => prop.tweet.text)
    })

    test('It should display tweet tweeted by the user in the query', async () => {
      const query = 'NASA'
      const tweets = Data.getTweetsBetween(0, 3)

      simulateSearchQuery(mock, query, tweets, mock.searchSelectOption.user)
      await flushPromises()

      const childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToBeValue(childrens, query, prop => prop.tweet.user.name)
    })
  })

  describe('Testing the page button', () => {
    let firstPageTweet = {}
    let olderButton = {}

    beforeEach(async () => {
      firstPageTweet = Data.getTweetsBetween(0, 3)
      simulateSearchQuery(mock, '', firstPageTweet, mock.searchSelectOption.keyword)
      await flushPromises()

      olderButton = mock.wrapper.find('#olderButton')
      Assert.componentExistance(olderButton)
    })

    test('It should change the current displayed tweet when user clicks on "older" and display a new set of tweets', async () => {
      const secondPageTweet = Data.getTweetsBetween(4, 5)
      mockedAxios.mockOkRequest(secondPageTweet)

      let childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToBeArray(childrens, firstPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)
      Assert.componentsPropToNotBeArray(childrens, secondPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)

      olderButton.trigger('click')
      await flushPromises()

      childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToBeArray(childrens, secondPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)
      Assert.componentsPropToNotBeArray(childrens, firstPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)
    })

    test('It should display the same tweets if user clicks on "older" then "recent" ', async () => {
      const secondPageTweet = Data.getTweetsBetween(4, 5)
      mockedAxios.mockMultipleRequest({ search: secondPageTweet })

      olderButton.trigger('click')
      await flushPromises()

      const recentButton = mock.wrapper.find('#recentButton')
      Assert.componentExistance(recentButton)

      // NOTE: questa terza richiesta mocckata può essere inutile, dipende tutto da se si fa cache dei tweet o no
      mockedAxios.mockMultipleRequest({ search: firstPageTweet })
      recentButton.trigger('click')
      await flushPromises()

      const childrens = mock.tweetsContainer.findAllComponents(Tweet)
      Assert.componentsPropToBeArray(childrens, firstPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)
      Assert.componentsPropToNotBeArray(childrens, secondPageTweet.statuses, prop => prop.tweet.id_str, tweet => tweet.id_str)
    })
  })
})
