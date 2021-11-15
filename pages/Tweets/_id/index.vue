<template>
  <c-flex justify="center">
    <c-box w="50%" mt="2em" p="1em" border-color="#8898a5" border-width="1px">
      <c-button variant-color="black" @click.prevent="$router.back()">Go Back</c-button>
      <h2 v-if="isLoaded"><span v-html="highlightedTweet" /></h2>
      <hr>
      <small>Tweet ID: {{ $route.params.id }}</small>
    </c-box>
  </c-flex>

</template>

<script>

import { CBox, CFlex, CButton } from '@chakra-ui/vue'
import { core } from '../../../common/core'

export default {
  components: {
    CBox,
    CFlex,
    CButton
  },
  data () {
    return {
      tweet: {},
      isLoaded: false
    }
  },
  computed: {
    highlightedTweet () {
      const hashReg = /(\$[A-Z]+)|((#|@)\w+)|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/gm
      let tw = (this.tweet.text).toString()
      tw = (tw).replace(hashReg, "<span class='blue'>$&</span>")
      return tw
    }
  },
  async created () {
    try {
      const res = await core.singleTweet(this.$route.params.id)
      this.tweet = res
      this.isLoaded = true
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style>
</style>
