import Vue from 'vue'
import Chakra from '@chakra-ui/vue'
import { config } from '@vue/test-utils'

Vue.use(Chakra, {
  $chakraTheme: () => {},
  $chakraColorMode: () => {},
  $SliderContext: () => {}
})
Vue.config.silent = false

// Vue.config.ignoredElements = ['nuxt-link']
// Mock Nuxt components
config.stubs.nuxt = { template: '<div />' }
config.stubs['nuxt-link'] = { template: '<a><slot /></a>' }

// TODO vanno rimossi, in pratica sostituiscono i components di chakra ui con questi, ma ovviamente
// non hanno tutte le funzionalità. Il problema però e che chakra ui non si carica correttamente
// durante i test.
// onfig.stubs['c-flex'] = { template: '<div><slot /></div>' }
// config.stubs['c-form-control'] = { template: '<form><slot /></form>' }
// config.stubs['c-input'] = { template: '<input>' }
// config.stubs['c-select'] = { template: '<select><slot /></select>' }
// config.stubs['c-button'] = { template: '<button><slot /></button>' }
// config.stubs['template'] = { template: '<di><CThemeProvider> <slot /> </CThemeProvider></div>' }

// https://stackoverflow.com/questions/54382414/fixing-react-leaflet-testing-error-cannot-read-property-layeradd-of-null/54384719#54384719
const createElementNSOrig = global.document.createElementNS
global.document.createElementNS = function (namespaceURI, qualifiedName) {
  if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'svg') {
    const element = createElementNSOrig.apply(this, arguments)
    element.createSVGRect = function () {}
    return element
  }
  return createElementNSOrig.apply(this, arguments)
}
