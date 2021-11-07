import Twitter from './twitter'

class Core {
  handleError (err) {
    console.log(err)
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
  * @return {Object[]} geolocalized tweets matching query and place parameters
  *
  */
  async search (query, place = '', radius = '1km') {
    try {
      let geocode = ''
      const queryObj = {}
      queryObj.q = query
      if (place) {
        const coordinates = await this.api.geo({ query: place })
        geocode = coordinates.latitude + ',' + coordinates.longitude + ',' + radius
        queryObj.geocode = geocode
      }
      const tweets = await this.api.search(queryObj)
      return tweets.statuses
    } catch (e) {
      return this.handleError(e)
    }
  }

  async singleTweet (id) {
    try {
      const response = await this.api.singleTweet(id)
      return response
    } catch (e) {
      return this.handleError(e)
    }
  }
}

const core = new Core()

export {
  core
}
