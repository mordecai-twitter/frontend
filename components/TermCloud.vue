<template lang="html">
  <div id="term-cloud-wrap">
    <vue-word-cloud
      style="height: 480px; width: 640px;"
      :words="words"
      :color="color"
      :font-family="fontFamily"
      :font-size-ratio="fontSizeRatio"
    />
  </div>
</template>

<script>
import VueWordCloud from 'vuewordcloud'

function calculateColor ([word, weight]) {
  if (weight > 50) { return 'Aqua' }
  if (weight > 30) { return 'BlueViolet' }
  if (weight > 20) { return 'DarkBlue' }
  if (weight > 15) { return 'Green' } else { return 'Red' }
}

export default {
  name: 'Termcloud',
  components: {
    VueWordCloud
  },
  props: {
    words: {
      type: Array,
      default: () => []
    },
    fontFamily: {
      type: String,
      default: 'Baloo Bhaijaan'
    },
    color: {
      type: Function,
      default: calculateColor
    },
    fontSizeRatio: {
      type: Number,
      default: 5
    }
  },
  data () {
    return {}
  },
  created () {
  },
  methods: {
  }
}
</script>

<style lang="
      css"
      scoped
    >
</style>
