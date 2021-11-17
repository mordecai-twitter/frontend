const axios = require('axios').default

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
    this.countUrl = this.v2Url + 'tweets/counts/recent'
  }

  /**
  * @summary Generic request function
  * @params {Object} url - Tweet back-end url
  * @params {Object} query - Tweet query object
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
  * @params {Object} query - Tweet query object, should include lat-lng or a query text
  *
  * @returns Array of possible locations
  */
  async geo (query) {
    return await this.request(this.geoUrl, query)
  }

  /**
  * @summary Get tweets of the given user
  * @params {String} username - Tweet username
  * @params {Object} query - Tweet query object
  *
  * @returns Array of tweets
  */
  async user (username, query) {
    return await this.request(this.userUrl + `/${username}`, query)
  }

  /**
  * @summary Basic tweet search.
  * @params {Object} query - Tweet query object
  *
  * @returns Tweets of the given user
  */
  async search (query) {
    console.log('In search')
    return await this.request(this.searchUrl, query)
  }

  /**
  * @summary Get the user timeline.
  * @params {Object} query - Tweet query object, should include user_id
  *
  * @returns Tweets of the given user
  */
  async userTweets (query) {
    console.log('In user')
    return { statuses: await this.request(this.userTweetsUrl, query) }
  }

  /**
  * @summary Get the next page of tweets.
  * @params {String} endpoint - Endpoint tha provides the next page
  * @params {Object} query - Tweet query object, should include max_id or since_id
  *
  * @returns Next tweets page
  */
  async nextTweets (endpoint, query) {
    return await this[endpoint](query)
  }

  /**
  * @summary Get a single tweet
  * @params {String} id - Tweet id
  * @returns - Tweet object
  */
  async singleTweet (id) {
    return await this.request(this.tweetUrl + `/${id}`)
  }

  /**
  * @summary Count how many tweets corresponds to the query parameter
  * @params {Object} query - Tweet query
  * @returns - Tweet count object see
  */
  async countTweets (query) {
    return await this.request(this.countUrl, query)
  }

  /**
  * @summary Get lat-lng information about the given place
  * @params {String} id - Tweet place id
  * @returns - Array of [lat, lng]
  */
  async geoId (id) {
    return await this.request(this.geoIdUrl + `/${id}`)
  }
}

export default twitter
