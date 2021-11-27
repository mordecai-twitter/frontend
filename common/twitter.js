import axios from 'axios'

/** Interface with Mordecai back-end */
class twitter {
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
    // V2 urls
    this.countV2Url = this.v2Url + 'tweets/counts/recent'
    this.searchV2Url = this.v2Url + 'tweets/search/all'
    this.userByIdUrl = this.v2Url + 'user/'
    // Custom urls
    this.sentimentUrl = 'sentiment'
  }

  /**
  * @summary Generic request function
  * @param {string} url - Tweet back-end url
  * @param {object} query - Tweet query object
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
  * @param {object} query - Tweet query object, should include lat-lng or a query text
  *
  * @returns Array of possible locations
  */
  async geo (query) {
    return await this.request(this.geoUrl, query)
  }

  /**
  * @summary Get tweets of the given user
  * @param {string} username - Tweet username
  * @param {object} query - Tweet query object
  *
  * @returns Array of tweets
  */
  async user (username, query) {
    return await this.request(this.userUrl + `/${username}`, query)
  }

  /**
  * @summary Get user info
  * @param {string} username - User id
  * @param {object} query - Tweet query object
  *
  * @returns User information
  */
  async userById (id, query) {
    return await this.request(this.userByIdUrl + `${id}`, query)
  }

  /**
  * @summary Basic tweet search.
  * @param {object} query - Tweet query object
  *
  * @returns Tweets of the given user
  */
  async search (query) {
    return await this.request(this.searchV2Url, query)
  }

  /**
  * @summary Get the user timeline.
  * @param {object} query - Tweet query object, should include user_id
  *
  * @returns Tweets of the given user
  */
  async userTweets (query) {
    return { statuses: await this.request(this.userTweetsUrl, query) }
  }

  /**
  * @summary Get the next page of tweets.
  * @param {string} endpoint - Endpoint tha provides the next page
  * @param {object} query - Tweet query object, should include max_id or since_id
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
  * @param {object} query - Tweet query
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
  * @param {object} query - Tweet place id
  * @returns - Sentiment analysis
  */
  async sentiment (query) {
    return await this.request(this.sentimentUrl, query)
  }
}

export default twitter
