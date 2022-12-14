/**
 * @file In this file is implemented the singleton design pattern to manage standard operation with twitter
 * @author Antonio Lopez, Andrea Zecca
 */

import Twitter from './twitter'

/** Paginator for scroll tweets */
class Paginator {
  /**
  * @summary Error Handler
  * @param {Object} error - Object containing the error informations
  *
  */
  handleError (err) {
    console.log(err)
  }

  /**
  * @summary Constructor for Paginator Object
  * @param {array} tweets - Array of tweets (even NULL)
  * @param {string} query - Query
  *
  */
  constructor (tweets, query) {
    if (tweets && tweets.meta.result_count > 0) { this.tweets = tweets } else { this.tweets = { data: [], meta: tweets?.meta } }
    //  The index is placed to the newest tweet in the current place
    this.index = 0
    //  Array for old sinc_id in order to use it as a range for previous request
    this.ids = []
    if (this.tweets.data.length > 0) {
      this.firstTweet = this.tweets.data[0]
      // Most recent tweet
      this.ids.push(this.getNewest())
      // Oldest tweet
      this.ids.push(this.getOldest())
    }
    this.api = new Twitter()
    this.query = query
    this.abortStreamCallback = null
  }

  /**
  * @summary Get the loaded tweets
  * @returns {array} Array of tweets
  */
  getTweets () {
    return this.tweets.data
  }

  /**
  * @summary Fetch the next (older) tweets
  * @returns Index of the current page
  */
  async next () {
    try {
      const realQuery = { ...this.query, until_id: this.ids[this.index + 1] }
      const tweets = await this.api.search(realQuery)
      if (tweets.meta.result_count > 0) {
        this.tweets = tweets
        this.index = this.index + 1
        // If a new index is loaded add it to the array
        if (this.index === this.ids.length - 1) {
          this.ids.push(this.getOldest())
        }
      }
    } catch (err) {
      this.handleError(err)
      return this.index
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
        const realQuery = { ...this.query, until_id: this.ids[this.index - 1] }
        const tweets = await this.api.search(realQuery)
        if (tweets.meta.result_count > 0) {
          this.tweets = tweets
          this.index = this.index - 1
          if (this.index === 0) {
            this.tweets.data = this.tweets.data.slice(0, this.tweets.data.length - 1)
            this.tweets.data.unshift(this.firstTweet)
          }
        }
      } catch (err) {
        this.handleError(err)
      }
    }
    return this.index
  }

  /**
  * @summary Get the oldest tweet id
  * @returns Return the oldest tweet id
  */
  getOldest () {
    return this.tweets.meta.oldest_id
  }

  /**
  * @summary Get the newest tweet id
  * @returns Return the oldest tweet id
  */
  getNewest () {
    return this.tweets.meta.newest_id
  }
}

/**  Core operation of Mordecai. */
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
  * @summary Query Generator given keyword, user and geo for Twitter API V2
  * @param {string} keyword - Keyword to search
  * @param {string} username - Username to search
  * @param {Object} geocode - Username to search
  * @param {string} place - Location to search
  *
  * @return {Object} Object containing the query fields
  */
  createQueryV2 ({ keyword, username = '', geocode = {}/* , place = '' */ }) {
    const query = {
      query: `${keyword}`,
      'tweet.fields': 'author_id,geo',
      'user.fields': 'username'
    }
    if (username !== '') {
      query.query = `${query.query} from:${username}`
    }
    if (geocode.latitude && geocode.longitude && geocode.radius) {
      query.query = `${query.query} point_radius:[${geocode.longitude} ${geocode.latitude} ${geocode.radius}km] has:geo`
    }
    return query
  }

  /**
  * @summary Search geolocalized tweets
  * @param {string} query - Text to search
  * @param {string} place - Location
  *
  * @return {Object[]} Geolocalized tweets matching query and place parameters
  */
  async search (query) {
    try {
      const tweets = await this.api.search(query)
      return new Paginator(tweets, query)
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * @summary Start a streaming
  * @param {string} query - Query object
  * @param {function} callback - Callback to invoke when new tweets are delivered
  * @param {function} errorCallback - Callback to invoke when an error occurs
  *
  */
  stream (query, callback, errorCallback) {
    this.abortStream()

    try {
      this.abortStreamCallback = this.api.stream(query, callback, errorCallback)
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * @summary Abort the current stream
  *
  */
  abortStream () {
    if (this.abortStreamCallback) {
      this.abortStreamCallback()
      this.abortStreamCallback = null
    }
  }

  /**
  * @summary Search a single tweets
  * @param {string} id - Tweet id
  *
  * @return {Object} tweet with the defined id
  */
  async singleTweet (id) {
    try {
      return await this.api.singleTweet(id)
    } catch (e) {
      return this.handleError(e)
    }
  }

  /**
  * @summary Get activity info about the given query and day
  * @param {object} query - Tweet id
  * @param {date} date - Day
  * @return {Object} tweet with the defined id
  */

  async dayTweetCount (query, date) {
    const endDate = new Date(date)
    endDate.setUTCDate(endDate.getUTCDate() - 6)
    endDate.setUTCHours(0, 0, 1)

    const queryDate = new Date(endDate)
    queryDate.setUTCDate(queryDate.getUTCDate() + 1)
    query = {
      start_time: endDate.toISOString(),
      end_time: queryDate.toISOString(),
      granularity: 'hour',
      ...query
    }
    try {
      return (await this.api.countTweets(query)).data
    } catch (err) {
      this.handleError(err)
    }
  }

  /**
  * @summary Sentiment analysis of the given query
  * @param {Object} query - Query object
  *
  * @return {Object} Sentiment analysis with the number of positive, negative, neutral tweets.
  */
  async sentiment (query) {
    try {
      const analysis = await this.api.sentiment(query)
      if (analysis?.comparative) {
        const total = analysis.positiveCount + analysis.negativeCount + analysis.neutralCount
        analysis.chartdata = [(analysis.positiveCount * 100 / total).toFixed(2), (analysis.negativeCount * 100 / total).toFixed(2), (analysis.neutralCount * 100 / total).toFixed(2)]
        return analysis
      }
      return undefined
    } catch (err) {
      console.log(err)
      return undefined
    }
  }

  /**
  * @summary Returns the most frequent words about a query
  * @param {Object} query - Tweet place id
  * @returns - Frequency analysis
  */
  async termcloud (query) {
    try {
      const analysis = await this.api.termcloud(query)
      if (analysis) {
        return analysis.map(x => [x.word, x.freq])
      }
      return undefined
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
  * @summary Search a User by Id
  * @param {string} id - User id
  *
  * @return {Object} - Object containing all the user info
  */
  async getUserInfo (id) {
    const query = {
      'user.fields': 'profile_image_url'
    }
    try {
      return await this.api.userById(id, query)
    } catch (e) {
      this.handleError(e)
    }
  }

  /**
  * @summary Get coordinates of the given place
  * @param {string} id - Place id
  *
  * @return {array} - [long, lat]
  */
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
  core,
  Paginator
}
