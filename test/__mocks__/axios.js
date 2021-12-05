import axios from 'axios'

function createOkRequest (data) {
  return {
    data,
    status: 200
  }
}

function mockOkRequest (data) {
  axios.create().get.mockResolvedValueOnce(createOkRequest(data))
}

function mockMultipleRequest (data) {
  axios.create().get.mockImplementation((url) => {
    // console.log(url)

    if ((/user\/.*/g).test(url)) {
      // console.log('Richiesta ad user')
      return Promise.resolve(createOkRequest({ data: data.user }))
    }
    switch (url) {
      case 'geo/search':
        // console.log('Richiesta ad geo')
        return Promise.resolve(createOkRequest(data.geo))
      case 'search/tweets':
        // console.log('Richiesta ad search')
        return Promise.resolve(createOkRequest(data.search))
      case 'statuses/user_timeline':
        // console.log('Richiesta ad user timeline')
        return Promise.resolve(createOkRequest(data.userTimeline))
      case 'statuses/show':
        // console.log('Richiesta ad show status')
        return Promise.resolve(createOkRequest(data.showStatus))
      case 'geo/id':
        // console.log('Richiesta ad geo id')
        return Promise.resolve(createOkRequest(data.geoId))
      case 'sentiment':
        // console.log('Richiesta ad sentiment')
        return Promise.resolve(createOkRequest(data.sentiment))
      case '2/tweets/counts/recent':
        // console.log('Richiesta ad tweets count recents')
        return Promise.resolve(createOkRequest(data.tweetCountRecent))
      default:
        // console.log('Unknown url')
        return undefined
    }
  })
}

export default { mockOkRequest, mockMultipleRequest }
