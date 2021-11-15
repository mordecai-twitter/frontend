import Twitter from './twitter'

class Paginator {
  handleError (err) {
    console.log(err)
  }

  constructor (tweets, query, endpoint) {
    this.tweets = tweets
    this.endpoint = endpoint
    //  The index is placed to the newest tweet in the current place
    this.index = 0
    //  Array for old sinc_id in order to use it as a range for previous request
    this.ids = []
    if (tweets.length > 0) {
      // Most recent tweet
      this.ids.push(tweets[0].id)
      // Oldest tweet
      this.ids.push(tweets[tweets.length - 1].id)
    }
    this.api = new Twitter()
    this.query = query
  }

  getTweets () {
    return this.tweets
  }

  /**
  * @summary Fetch the next (older) tweets
  * @returns Index of the current page
  */
  async next () {
    try {
      const realQuery = { ...this.query, max_id: this.ids[this.index + 1] }
      const tweets = await this.api.nextTweets(this.endpoint, realQuery)
      if (tweets.statuses.length > 0) {
        this.tweets = tweets.statuses
        this.index = this.index + 1
        // If a new index is loaded add it to the array
        if (this.index === this.ids.length - 1) {
          this.ids.push(this.tweets[this.tweets.length - 1].id)
        }
      }
    } catch (err) {
      this.handleError(err)
    }
    return this.index
  }

  /**
  * @summary Fetch the previous (newer) tweets
  * @returns Index of the current page
  */
  async prev () {
    if (this.index > 0) {
      try {
        const realQuery = { ...this.query, since_id: this.ids[this.index], max_id: this.ids[this.index - 1] }
        const tweets = await this.api.nextTweets(this.endpoint, realQuery)
        if (tweets.statuses.length > 0) {
          this.tweets = tweets.statuses
          this.index = this.index - 1
        }
      } catch (err) {
        this.handleError(err)
      }
    }
    return this.index
  }

  /**
  * @summary Get the oldest tweet
  * @returns Return the oldest tweet
  */
  getOldest () {
    return this.tweets[this.tweets.length - 1]
  }
}

class Core {
  handleError (err) {
    console.log(err)
  }

  constructor () {
    this.api = new Twitter()
    this.since_id = ''
    this.max_id = ''
  }

  addDays (date, days) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result.toISOString().split('T')[0]
  }

  /**
  * Search geolocalized tweets
  * @params {string} query - Text to search
  * @params {string} place - Location
  * @return {Object[]} geolocalized tweets matching query and place parameters
  *
  */
  async search (keyword, query = {}, place = '', radius = '10km') {
    try {
      let geocode = ''
      const queryObj = { ...query }
      queryObj.q = keyword
      if (place) {
        const coordinates = await this.api.geo({ query: place })
        geocode = coordinates.latitude + ',' + coordinates.longitude + ',' + radius
        queryObj.geocode = geocode
      }
      const tweets = await this.api.search(queryObj)
      return new Paginator(tweets.statuses, queryObj, 'search')
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * Search a single tweets
  * @params {string} id - id of tweet to search
  * @return {Object} tweet with the defined id
  *
  */
  async singleTweet (id) {
    try {
      const response = await this.api.singleTweet(id)
      return response
    } catch (e) {
      return this.handleError(e)
    }
  }

  async userTimeline (username, query = {}) {
    try {
      let response = await this.api.user(username)
      const userId = response.data.id
      query = { ...query, user_id: userId }
      response = await this.api.userTweets(query)
      return new Paginator(response.statuses, query, 'userTweets')
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * @summary Get the tweets in the past days
  * @params {String} keyword - Text query
  * @params {Objetc} query - Query object
  * @param {Number} days - Number of days back in the past
  * @return {Object[]} geolocalized tweets matching query and place parameters
  */
  async recentTweets (keyword, query, days) {
    const endDate = Date.parse(this.addDays(new Date(), -days))
    const dataSet = []
    query = {
      result: 'recent',
      count: 100,
      ...query
    }
    try {
      const page = await this.search(keyword, query)
      if (Date.parse(page.getOldest().created_at) > endDate) {
        dataSet.push(...page.getTweets())
      }
      while (Date.parse(page.getOldest().created_at) > endDate) {
        console.log(Date.parse(page.getOldest().created_at), endDate)
        await page.next()
        dataSet.push(...page.getTweets())
      }
    } catch (err) {
      console.log(err)
    }
    console.log(dataSet)
    return dataSet
  }
}

const core = new Core()

export {
  core
}
