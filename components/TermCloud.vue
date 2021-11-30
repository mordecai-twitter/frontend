<template lang="html">
  <div id="term-cloud-wrap">
    <vue-word-cloud
      style="height: 480px; width: 640px;"
      :words="words"
      :color="color"
      :font-family="'Lucida Console'"
      :font-size-ratio="5"
      :spacing="0.2"
      :rotation="rotation"
      :animation-duration="1500"
      :enter-animation="enterAnimation"
    >
      <template slot-scope="{text, weight, word}">
        <div :title="weight" style="cursor: pointer;" @click="onWordClick(word)" @mouseover="onHover(word)">
          {{ text }}
        </div>
      </template>
    </vue-word-cloud>
    <div v-if="!!hoverWord" id="infoTermCloud">
      <c-box>
        Parola: {{ hoverWord[0] }}, Peso: {{ hoverWord[1] }}
      </c-box>
    </div>
  </div>
</template>

<script>
import VueWordCloud from 'vuewordcloud'
import Chance from 'chance'

export default {
  name: 'Termcloud',
  components: {
    VueWordCloud
  },
  props: {
    words: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      hoverWord: undefined,
      enterAnimation: {
        opacity: 0,
        transform: 'scale3d(0.3,0.3,0.3)'
      },
      color: undefined,
      rotation: undefined,
      wordToIndex: {},
      intervals: []
    }
  },
  watch: {
    words () {
      this.updateWordCloud()
    }
  },
  mounted () {
    this.color = this.calculateColor
    this.rotation = this.calculateRotation
    this.updateWordCloud()
  },
  methods: {
    updateWordCloud () {
      if (!this.words) { return }

      this.wordToIndex = {}
      this.intervals = []
      this.words.forEach((elem, index) => { this.wordToIndex[elem[0]] = index })

      const maxIndex = 4
      for (let i = 0; i < maxIndex; i += 1) {
        this.intervals[i] = i > 0 ? this.intervals[i - 1] + Math.floor(this.words.length / (maxIndex + 1)) : Math.floor(this.words.length / (maxIndex + 1))
      }
    },
    wordIndex (word) {
      return this.wordToIndex[word]
    },
    onWordClick (word) {
      this.$emit('onWordClick', word)
    },
    onHover (word) {
      this.hoverWord = word
    },
    calculateColor ([word, weight]) {
      const index = this.wordIndex(word)

      if (index <= this.intervals[0]) {
        return '#ffd077'
      } else if (index <= this.intervals[1]) {
        return '#3bc4c7'
      } else if (index <= this.intervals[2]) {
        return '#3a9eea'
      } else if (index <= this.intervals[3]) {
        return '#f02e4b'
      } else { return '#de6488' }
    },
    calculateRotation (word) {
      const chance = new Chance(word[0])
      return chance.pickone([0, 1 / 8, 3 / 4, 7 / 8])
    }

  }
}
</script>
