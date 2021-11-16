const axios = require('axios').default

class twitter {
  handleError (err) {
    console.log(err)
  }

  constructor () {
    this.baseURL = 'https://site202137.tw.cs.unibo.it/api/'
    this.v2Url = '2/'

    this.api = axios.create({ baseURL: this.baseURL })
    this.searchUrl = 'search/tweets'
    this.geoUrl = 'geo/search'
    this.userUrl = 'user'
    this.userTweetsUrl = 'statuses/user_timeline'
    this.tweetUrl = 'statuses/show'
    this.geoIdUrl = 'geo/id'

    this.countUrl = this.v2Url + 'tweets/counts/recent'
  }

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
  * @params {Object} query - place to search
  *
  */
  async geo (query) {
    return await this.request(this.geoUrl, query)
  }

  async user (username, query) {
    return await this.request(this.userUrl + `/${username}`, query)
  }

  async search (query) {
    console.log('In search')
    return await this.request(this.searchUrl, query)
  }

  async userTweets (query) {
    console.log('In user')
    return { statuses: await this.request(this.userTweetsUrl, query) }
  }

  /**
  * @params {String} endpoint - Endpoint name
  * @params {Object} query - place to search
  *
  * @returns Next tweet page
  */
  async nextTweets (endpoint, query) {
    return await this[endpoint](query)
  }

  /**
  * @params {String} id - Tweet id
  *
  */
  async singleTweet (id) {
    return await this.request(this.tweetUrl + `/${id}`)
  }

  async countTweets (query) {
    return await this.request(this.countUrl, query)
  }

  async geoId (id) {
    return await this.request(this.geoIdUrl + `/${id}`)
  }
}

export default twitter
