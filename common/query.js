/**
 * @file Query management
 */

/**
* @class
*/
class Query {
  /**
 * Create a Query object.
 * @function
 */
  constructor () {
    this.query = {}
  }

  /**
 * Add a field to the Query object.
 * @function
 * @param {string} key - The key of the field
 * @param {string} value - The value of the field
 * @return {string} return the value of the field added
 * @example
 * queryObject.addField('user', 'uniboSwe3')
 */
  addField (key, value) {
    this.query[key] = value
    return this.query[key]
  }

  /**
  * Append a string to a particular query field.
  * @function
  * @param {string} key - The key of the field to append
  * @param {string} spacer - The spacer between the original field value and the appended value
  * @param {string} name - The key to assign the value
  * @param {string} sign - The sign between the name and the value
  * @param {string} value - The value of the field
  * @return {string} return the new value of the field
  * @example
  * queryObject.appendString('user', ' ', 'geocode', ':', geocodeInfo)
  */
  appendString (key, spacer, name, sign, value) {
    this.query[key] = `${this.query[key] ? `${this.query[key]}${spacer}` : ''}${name}${sign}${value}`
    return this.query[key]
  }

  /**
  * @function
  * @return {Object} the query object constructed
  */
  get () {
    return this.query
  }
}

/**
* @interface
* @class
*/
class QueryBuilder {
  /**
  * @function
  */
  constructor () {
    this.query = new Query()
  }

  /**
  * Set a keyword query
  * @function
  * @param {string} keyword - The keyword query to be set
  */
  setKeyword (keyword) { return this }

  /**
  * Set a geocode query
  * @function
  * @param {string} geocode - The geocode query to be set
  */
  setGeocode (geocode) { return this }

  /**
  * Set a username query
  * @function
  * @param {string} username - The username query to be set
  */
  setUsername (username) { return this }

  /**
  * Build the query Object
  * @function
  * @return The query object created
  */
  build () { return this.query }

  /**
  * Set an expansion to Query
  * @function
  * @return This
  */
  setExpansion (expansion, value) { return this }
}

/**
* Class to create a query based on Twitter V1 api
* @class
* @link https://developer.twitter.com/en/docs/twitter-api/v1
* @implements QueryBuilder
*/
class V1Builder extends QueryBuilder {
  setKeyword (keyword) {
    this.query.addField('q', keyword)
    return this
  }

  setGeocode (geocode) {
    this.query.addField('geocode', `${geocode.longitude},${geocode.latitude},${geocode.radius}km`)
    return this
  }

  setUsername (username) {
    this.query.addField('user_id', username)
    return this
  }

  setExpansion (expansion, value) {
    this.query.addField(expansion, value)
    return this
  }
}

/**
* Class to create a query based on Twitter V2 api
* @class
* @link https://developer.twitter.com/en/docs/twitter-api
* @implements QueryBuilder
*/
class V2Builder extends QueryBuilder {
  setExpansion (expansion, value) {
    this.query.appendString(expansion, ',', '', '', value)
    return this
  }

  setKeyword (keyword) {
    this.query.appendString('query', ' ', '', '', keyword)
    return this
  }

  setGeocode (geocode) {
    this.query.appendString('query', ' ', 'point_radius', ':', `[${geocode.longitude} ${geocode.latitude} ${geocode.radius}km] has:geo`)
    return this
  }

  setUsername (username) {
    this.query.appendString('query', ' ', 'from', ':', username)
    return this
  }
}

/**
* @class queryDirector
*/
class QueryDirector {
  constructor (builder) {
    if (!(builder instanceof QueryBuilder)) {
      console.log('The builder is not supported')
      builder = new V2Builder()
    }
    this.builder = builder
  }

  changeBuilder (builder) {
    if (builder instanceof QueryBuilder) {
      this.builder = builder
    }
  }

  makeSearchQuery (keyword, username, geocode) {
    this.builder.setExpansion('max_results', '30')
    this.builder.setExpansion('user.fields', 'username')
    this.builder.setExpansion('tweet.fields', 'author_id,geo')
    if (keyword && typeof keyword === 'string') {
      this.builder.setKeyword(keyword)
    }
    if (username && typeof username === 'string') {
      this.builder.setUsername(username)
    }
    if (geocode) {
      this.builder.setGeocode(geocode)
    }
    return this.builder.build()
  }

  makeContestQuery (keyword) {
    const builder = new V2Builder()
    if (keyword && typeof keyword === 'string') {
      builder.setExpansion('tweet.fields', 'author_id')
      builder.setKeyword(keyword)
    }
    return builder.build()
  }

  makeTriviaQuery (keyword) {
    const builder = new V2Builder()
    if (keyword && typeof keyword === 'string') {
      builder.setExpansion('tweet.fields', 'author_id,created_at')
      builder.setKeyword(keyword)
    }
    return builder.build()
  }
}

export { QueryDirector, V1Builder, V2Builder, QueryBuilder, Query }
