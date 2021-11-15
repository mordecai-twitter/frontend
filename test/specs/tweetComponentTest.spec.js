/* eslint-disable no-useless-escape */
import { mount } from '@vue/test-utils'
import Tweet from '../../components/Tweet.vue'
import { getTweetsData } from '../helper/data.js'

const mock = {}

describe("Test for the 'tweet' components", () => {
  beforeEach(() => {
    mock.link = 'https://stackoverflow.com/'
    mock.hashtag = '#g20'
    mock.plainText = 'To make room for more expression, we will now count all emojis as equal—including those with gender‍‍‍ ‍‍and skin t…'

    mock.tweet = getTweetsData().statuses[0]
    mock.tweet.text = `${mock.plainText}, ${mock.link}, ${mock.hashtag}`

    mock.wrapper = mount(Tweet, {
      propsData: {
        tweet: mock.tweet
      },
      stubs: {
        NuxtLink: true,
        CBox: true
      }
    })
  })

  test('It should display the text of the tweet passed as props', () => {
    expect(mock.wrapper.text()).toContain(mock.tweet.text)
  })

  test('It should display link with a particular style', () => {
    expect(mock.wrapper.html()).toContain(`<span class=\"blue\">${mock.link}</span>`)
  })

  test('It should display hashtag with a particular style', () => {
    expect(mock.wrapper.html()).toContain(`<span class=\"blue\">${mock.hashtag}</span>`)
  })

  test('It should not display simple text with a particular style', () => {
    expect(mock.wrapper.html()).not.toContain(`<span class=\"blue\">${mock.plainText}</span>`)
  })
})
