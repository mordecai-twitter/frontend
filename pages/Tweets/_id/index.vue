<template>
  <c-flex justify="center">
  <c-box w="50%" mt="2em" p="1em" border-color="#8898a5" border-width="1px">
    <c-button variant-color="black" @click.prevent="$router.back()">Go Back</c-button>
    <h2 v-if="isLoaded"><span v-html="highlightedTweet"></span></h2>
    <hr>
  <small>Tweet ID: {{ $route.params.id }}</small>
  </c-box>
</c-flex>

</template>

<script>

import { twitterClient } from '../../../common/twitter'

export default {
  data () {
    return {
      tweet: {},
      isLoaded: false
    }
  },
  async created () {
    try {
      const res = await twitterClient.v2.singleTweet(this.$route.params.id)
      this.tweet = res
      this.isLoaded = true
    } catch (err) {
      console.log(err)
    }
  },
  computed: {
    highlightedTweet: function() {
      let hashReg = /(\$[A-Z]+)|((#|@)\w+)|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gm;
      let tw = (this.tweet.data.text).toString()
      tw = (tw).replace(hashReg, "<span class='blue'>$&</span>")
      console.log(tw)
      return tw
    }
  }
}
</script>

<style>
</style>
