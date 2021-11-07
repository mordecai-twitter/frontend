const axios = require('axios').default

class twitter {
  #handleError (err) {
    console.log(err)
  }

  constructor () {
    this.baseURL = 'https://site202137.tw.cs.unibo.it/api/'
    this.api = axios.create({ baseURL: this.baseURL })
    this.searchUrl = 'search/tweets'
    this.geoUrl = 'geo/search'
    this.userUrl = 'user/:username'
    this.tweetUrl = 'statuses/show'
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

  async search (query) {
    console.log(query)
    return await this.request(this.searchUrl, query)
  }

  /**
  * @params {Object} query - place to search
  *
  */
  async geo (query) {
    return await this.request(this.geoUrl, query)
  }

  async user (query) {
    return await this.request(this.userUrl, query)
  }

  /**
  * @params {String} id - Tweet id
  *
  */
  async singleTweet (id) {
    return await this.request(this.tweetUrl + `/${id}`)
  }
}

export default twitter
