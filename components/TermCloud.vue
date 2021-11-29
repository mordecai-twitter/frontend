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

function calculateColor ([word, weight]) {
  return weight > 40 ? '#ffd077' : weight > 17 ? '#3bc4c7' : weight > 10 ? '#3a9eea' : weight > 5 ? '#ff4e69' : '#461e47'
}

function calculateRotation (word) {
  const chance = new Chance(word[0])
  return chance.pickone([0, 1 / 8, 3 / 4, 7 / 8])
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
    color: {
      type: Function,
      default: calculateColor
    },
    rotation: {
      type: Function,
      default: calculateRotation
    }
  },
  data () {
    return {
      hoverWord: undefined,
      enterAnimation: {
        opacity: 0,
        transform: 'scale3d(0.3,0.3,0.3)'
      }
    }
  },
  methods: {
    onWordClick (word) {
      this.$emit('onWordClick', word)
    },
    onHover (word) {
      this.hoverWord = word
    }
  }
}
</script>
