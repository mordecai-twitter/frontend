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

export { mockOkRequest }
