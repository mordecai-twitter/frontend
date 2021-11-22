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
    return undefined
  }

  constructor () {
    this.api = new Twitter()
    this.since_id = ''
    this.max_id = ''
  }

  /**
  * Search geolocalized tweets
  * @params {string} query - Text to search
  * @params {string} place - Location
  *
  * @return {Object[]} Geolocalized tweets matching query and place parameters
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
  * @params {string} id - Tweet id
  *
  * @return {Object} tweet with the defined id
  */
  async singleTweet (id) {
    try {
      const response = await this.api.singleTweet(id)
      return response
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * @summary User tweets timeline
  * @params {String} keyword - Text query
  * @params {Object} query - Query object
  * @param {Number} day - Date
  *
  * @return {Paginator} Paginator object
  */
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

  async dayTweetCount (query, date) {
    const endDate = new Date(date)
    endDate.setUTCDate(endDate.getUTCDate() - 6)
    endDate.setUTCHours(0, 0, 1)

    const queryDate = new Date(endDate)
    queryDate.setUTCDate(queryDate.getUTCDate() + 1)

    console.log('Making query...')
    query = {
      start_time: endDate.toISOString(),
      end_time: queryDate.toISOString(),
      granularity: 'hour',
      ...query
    }
    console.log(query)
    try {
      return (await this.api.countTweets(query)).data
    } catch (err) {
      console.log(err)
    }
  }

  async sentiment (query) {
    try {
      const analysis = await this.api.sentiment(query)
      const total = analysis.positiveCount + analysis.negativeCount + analysis.neutralCount
      analysis.chartdata = [(analysis.positiveCount * 100 / total).toFixed(2), (analysis.negativeCount * 100 / total).toFixed(2), (analysis.neutralCount * 100 / total).toFixed(2)]
      analysis.best.tweet = await this.singleTweet(analysis.best.tweet.id)
      analysis.worst.tweet = await this.singleTweet(analysis.worst.tweet.id)
      return analysis
    } catch (err) {
      console.log(err)
      return undefined
    }
  }

  async getGeo (placeId) {
    try {
      const res = await this.api.geoId(placeId)
      return res.centroid
    } catch (err) {
      return this.handleError(err)
    }
  }
}

const core = new Core()

export {
  core
}
