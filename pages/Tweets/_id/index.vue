<template>
  <div>
    <a href="" @click.prevent="$router.back()">Go Back</a>
    <h2 v-if="isLoaded">{{ tweet.data.text }}</h2>
    <hr>
    <small>Tweet ID: {{ $route.params.id }}</small>
  </div>
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
  }
}
</script>

<style>
</style>
