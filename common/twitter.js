import axios from 'axios'

/** Interface with Mordecai back-end */
class Twitter {
  handleError (err) {
    console.log(err)
  }

  constructor () {
    // Base urls
    this.baseURL = 'https://site202137.tw.cs.unibo.it/api/'
    this.v2Url = '2/'

    // V1 urls
    this.api = axios.create({ baseURL: this.baseURL })
    this.searchUrl = 'search/tweets'
    this.geoUrl = 'geo/search'
    this.userUrl = 'user'
    this.userTweetsUrl = 'statuses/user_timeline'
    this.tweetUrl = 'statuses/show'
    this.geoIdUrl = 'geo/id'
    this.streamUrl = 'stream'
    // V2 urls
    this.countV2Url = this.v2Url + 'tweets/counts/recent'
    this.searchV2Url = this.v2Url + 'tweets/search/all'
    this.userByIdUrl = this.v2Url + 'user/'

    // Custom urls
    this.sentimentUrl = 'sentiment'
    this.termCloudUrl = 'termcloud'
    this.contestUrl = 'contest'
    this.triviaUrl = 'trivia'
  }

  /**
  * @summary Generic request function
  * @param {string} url - Tweet back-end url
  * @param {Object} query - Tweet query object
  *
  * @returns Tweet response body
  */

  async request (url, query) {
    try {
      const res = await this.api.get(url, { params: query })
      if (res.status === 200) {
        return res.data
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  /**
  * @summary Get tweets place informations
  * @param {Object} query - Tweet query object, should include lat-lng or a query text
  *
  * @returns Array of possible locations
  */
  async geo (query) {
    return await this.request(this.geoUrl, query)
  }

  /**
  * @summary Get tweets of the given user
  * @param {string} username - Tweet username
  * @param {Object} query - Tweet query object
  *
  * @returns Array of tweets
  */
  async user (username, query) {
    return await this.request(this.userUrl + `/${username}`, query)
  }

  /**
  * @summary Get user info
  * @param {string} username - User id
  * @param {Object} query - Tweet query object
  *
  * @returns User information
  */
  async userById (id, query) {
    return await this.request(this.userByIdUrl + `${id}`, query)
  }

  /**
  * @summary Basic tweet search.
  * @param {Object} query - Tweet query object
  *
  * @returns Tweets of the given user
  */
  async search (query) {
    return await this.request(this.searchV2Url, query)
  }

  /**
  * @summary Start a stream using V1 API
  * @param {string} query - Keyword to search.
  * @param {function} callback - Callback to invoke when new tweets are delivered
  * @param {function} errorCallback - Callback to invoke when an error occurs
  *
  * @return {Query} - Query object
  */
  stream (query, callback, errorCallback) {
    const regExHash = /#/g
    const regExTag = /@/g
    const parameters = Object.entries(query).map(([k, v]) => `${k}=${v.replace(regExHash, '%23').replace(regExTag, '%35')}`).join('&')
    const abortController = new AbortController()
    let done = false

    fetch(this.baseURL + this.streamUrl + '?' + parameters, { signal: abortController.signal })
      .then(async (response) => {
        const reader = response.body.getReader()
        let buffer = ''

        while (!done) {
          const result = await reader.read()
          done = done || result.done

          // It's possible to receive more than one tweet at once,
          // so we split them
          buffer += new TextDecoder().decode(result.value)

          let curlyCount = 0
          let insideQuotes = false

          for (let i = 0; i < buffer.length; i++) {
            if (buffer[i] === '\\') {
              i += 1
              if (i >= buffer.length) {
                break
              }
              continue
            }
            if (buffer[i] === '"') {
              insideQuotes = !insideQuotes
            }

            if (!insideQuotes) {
              if (buffer[i] === '{') {
                curlyCount++
              }

              if (buffer[i] === '}') {
                curlyCount--

                if (curlyCount === 0) {
                  const decodedTweet = JSON.parse(buffer.substring(0, i + 1))
                  buffer = buffer.substring(i + 1)
                  i = -1
                  if (!decodedTweet.type || decodedTweet.type !== 'keep-alive') {
                    callback(decodedTweet)
                  } else {
                    console.log('keep-alive')
                  }
                }
              }
            }
          }
        }
      })
      .catch(errorCallback)

    // This callback will abort the stream
    return () => {
      done = true
      abortController.abort()
    }
  }

  /**
  * @summary Get the user timeline.
  * @param {Object} query - Tweet query object, should include user_id
  *
  * @returns Tweets of the given user
  */
  async userTweets (query) {
    return { statuses: await this.request(this.userTweetsUrl, query) }
  }

  /**
  * @summary Get the next page of tweets.
  * @param {string} endpoint - Endpoint tha provides the next page
  * @param {Object} query - Tweet query object, should include max_id or since_id
  *
  * @returns Next tweets page
  */
  async nextTweets (endpoint, query) {
    return await this[endpoint](query)
  }

  /**
  * @summary Get a single tweet
  * @param {string} id - Tweet id
  * @returns - Tweet object
  */
  async singleTweet (id) {
    return await this.request(this.tweetUrl + `/${id}`)
  }

  /**
  * @summary Count how many tweets corresponds to the query parameter
  * @param {Object} query - Tweet query
  * @returns - Tweet count object see
  */
  async countTweets (query) {
    return await this.request(this.countV2Url, query)
  }

  /**
  * @summary Get lat-lng information about the given place
  * @param {string} id - Tweet place id
  * @returns - Array of [lat, lng]
  */
  async geoId (id) {
    return await this.request(this.geoIdUrl + `/${id}`)
  }

  /**
  * @summary Returns the sentiment about a query
  * @param {Object} query - Tweet place id
  * @returns - Sentiment analysis
  */
  async sentiment (query) {
    return await this.request(this.sentimentUrl, query)
  }

  /**
  * @summary Returns the most frequent words about a query
  * @param {Object} query - Tweet place id
  * @returns - Frequency analysis
  */
  async termcloud (query) {
    return await this.request(this.termCloudUrl, query)
  }

  /**
  * @summary Make a contest search
  * @param {Object} query - Contest query
  */
  async contest (query) {
    return await this.request(this.contestUrl, query)
  }

  /**
  * @summary Make a contest search
  * @param {Object} query - Contest query
  */
  async trivia (query) {
    return await this.request(this.triviaUrl, query)
  }
}

export default Twitter
