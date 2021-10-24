<template lang="html">
  <div class="">
    <h2>Tweets:</h2>
    <Tweet v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
  </div>
</template>

<script>
import Tweet from '../../components/Tweet'
import { twitterClient } from '../../common/twitter'
export default {
  components: {
    Tweet
  },
  data () {
    return {
      tweets: Array
    }
  },
  async created () {
    this.tweets = []
    try {
      const res = await twitterClient.v2.search('Javascript', { 'media.fields': 'url' })
      // const res = await twitterClient.v2.userTimeline('12', { exclude: 'replies' })
      this.tweets = res._realData.data
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style lang="css" scoped>

</style>
