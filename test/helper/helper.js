import { CThemeProvider } from '@chakra-ui/vue'
import { mount } from '@vue/test-utils'
import { mockOkRequest } from '../mocks/axios'

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomlyInsertString (containerString, stringToInsert) {
  const position = random(containerString.length, 0)
  const newString = containerString.substr(0, position) + stringToInsert + containerString.substr(position)

  return newString
}

function getWrappedPage (Page) {
  return {
    render (h) {
      return h(CThemeProvider, [h(Page)])
    }
  }
}

function getMountedWrappedPage (Page) {
  const wrappedPage = getWrappedPage(Page)

  return mount(wrappedPage, {
    // localVue,
    stubs: {
      NuxtLink: true,
      Nuxt: true
    }
  }
  )
}

function simulateSearchQuery (mock, query, tweet, selectOption) {
  // Creo una mock requestResponse che verrà restituita quando si fa una richiesta get
  mockOkRequest(tweet)

  // Seleziono la query per keyword
  selectOption.setSelected()

  // Imposto la query
  mock.textInput.setValue(query)

  mock.goButton.trigger('click')
}

export {
  getWrappedPage,
  getMountedWrappedPage,
  randomlyInsertString,
  random,
  simulateSearchQuery
}
