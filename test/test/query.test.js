import { QueryDirector, V1Builder, V2Builder, Query } from '../../common/query'

describe('Test for all the class in Query file', () => {
  describe('Test for the Query class', () => {
    it('It should add a field to the query object', () => {
      const query = new Query()
      const field = 'fieldTest'
      const value = 'valueTest'

      const valueAdded = query.addField(field, value)
      expect(valueAdded).toBe(value)

      const expectedQuery = {}
      expectedQuery[field] = value
      expect(query.get()).toEqual(expect.objectContaining(expectedQuery))
    })

    it('It should create a new field with appendString if the field was empty', () => {
      const query = new Query()
      const field = 'fieldTest'
      const newField = query.appendString(field, '', 'nameTest', ':', 'valueTest')

      expect(newField).toBe('nameTest:valueTest')

      const expectedQuery = {}
      expectedQuery[field] = 'nameTest:valueTest'
      expect(query.get()).toEqual(expect.objectContaining(expectedQuery))
    })

    it('It should create append a new string to the field value with appendString if the field was not empty', () => {
      const query = new Query()
      const field = 'fieldTest'
      query.addField(field, 'firstValue')

      const newField = query.appendString(field, '-', 'nameTest', ':', 'valueTest')
      const expectedField = 'firstValue-nameTest:valueTest'

      expect(newField).toBe(expectedField)

      const expectedQuery = {}
      expectedQuery[field] = expectedField
      expect(query.get()).toEqual(expect.objectContaining(expectedQuery))
    })
  })

  describe('Test for the V1 api query builder', () => {
    it('It should generate a correct V1 api query with the username given', () => {
      const username = 'userTest'
      const v1Builder = new V1Builder()

      v1Builder.setUsername(username)
      const resQuery = v1Builder.build()

      expect(resQuery.query).toEqual(expect.objectContaining({ user_id: username }))
    })

    it('It should generate a correct V1 api query with the keyword given', () => {
      const keyword = 'keywordTest'
      const v1Builder = new V1Builder()

      v1Builder.setKeyword(keyword)
      const resQuery = v1Builder.build()

      expect(resQuery.query).toEqual(expect.objectContaining({ q: keyword }))
    })

    it('It should generate a correct V1 api query with the geocode given', () => {
      const geocode = {
        longitude: 37.781157,
        latitude: -122.398720,
        radius: 25
      }
      const v1Builder = new V1Builder()

      v1Builder.setGeocode(geocode)
      const resQuery = v1Builder.build()

      expect(resQuery.query).toEqual(expect.objectContaining({ geocode: '37.781157,-122.39872,25km' }))
    })
  })

  describe('Test for the V2 api query builder', () => {
    it('It should generate a correct V2 api query with the username given', () => {
      const username = 'userTest'
      const v2Builder = new V2Builder()

      v2Builder.setUsername(username)
      const resQuery = v2Builder.build()

      expect(resQuery.query).toEqual(expect.objectContaining({ query: 'from:' + username }))
    })

    it('It should generate a correct V2 api query with the keyword given', () => {
      const keyword = 'keywordTest'
      const v2Builder = new V2Builder()

      v2Builder.setKeyword(keyword)
      const resQuery = v2Builder.build()
      expect(resQuery.query).toEqual(expect.objectContaining({ query: keyword }))
    })

    it('It should generate a correct V2 api query with the geocode given', () => {
      const geocode = {
        longitude: 37.781157,
        latitude: -122.398720,
        radius: 25
      }
      const v2Builder = new V2Builder()

      v2Builder.setGeocode(geocode)
      const resQuery = v2Builder.build()
      const expectedQuery = {
        query: 'point_radius:[37.781157 -122.39872 25km] has:geo',
        'tweet.fields': 'author_id,geo',
        'user.fields': 'username'
      }

      expect(resQuery.query).toEqual(expect.objectContaining(expectedQuery))
    })
  })

  describe('Test for the QueryDirector class', () => {
    it('It must be able to build V1 query correctly', () => {
      const keyword = 'keywordTest'
      const username = 'usernameTest'
      const geocode = {
        longitude: 37.781157,
        latitude: -122.398720,
        radius: 25
      }

      const director = new QueryDirector(new V1Builder())
      const query = director.makeSearchQuery(keyword, username, geocode)

      const expectedQuery = {
        q: keyword,
        user_id: username,
        geocode: `${geocode.longitude},${geocode.latitude},${geocode.radius}km`
      }

      expect(query.query).toEqual(expect.objectContaining(expectedQuery))
    })

    it('It must be able to build V2 query correctly', () => {
      const keyword = 'keywordTest'
      const username = 'usernameTest'
      const geocode = {
        longitude: 37.781157,
        latitude: -122.398720,
        radius: 25
      }

      const director = new QueryDirector(new V2Builder())
      const query = director.makeSearchQuery(keyword, username, geocode)

      const expectedQuery = { query: 'keywordTest from:usernameTest point_radius:[37.781157 -122.39872 25km] has:geo', 'tweet.fields': 'author_id,geo', 'user.fields': 'username' }

      expect(query.query).toEqual(expect.objectContaining(expectedQuery))
    })

    it('It must be able to change the builder', () => {
      const director = new QueryDirector(new V1Builder())
      const keyword = 'keywordTest'
      director.changeBuilder(new V2Builder())
      const query = director.makeSearchQuery(keyword)
      const expectedQuery = { query: keyword }

      expect(query.query).toEqual(expect.objectContaining(expectedQuery))
    })
  })
})
