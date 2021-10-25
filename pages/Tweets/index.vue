<template lang="html">
  <div class="">
    <h2>Tweets:</h2>
    <input v-model="query" type="text" placeholder="Insert here some text...">
    <input type="button" name="" value="Search" @click="search">
    <Tweet v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
    <button type="button" name="button" @click="prevPage">Previous</button>
    <button type="button" name="button" @click="nextPage">Next</button>
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
      tweets: Array,
      page: Object,
      query: ''
    }
  },
  created () {
    this.tweets = []
  },
  methods: {
    async search () {
      this.tweets = []
      console.log(this.query)
      try {
        const paginator = await twitterClient.v2.search(this.query)
        // const res = await twitterClient.v2.userTimeline('12', { exclude: 'replies' })
        this.page = paginator
        this.tweets = paginator.tweets
      } catch (err) {
        console.log(err)
      }
    },
    async nextPage () {
      try {
        const res = await this.page.next()
        this.page = res
        this.tweets = this.page.tweets
      } catch (err) {
        console.log(err)
      }
    },
    async prevPage () {
      try {
        const res = await this.page.previous()
        this.page = res
        this.tweets = this.page.tweets
      } catch (err) {
        console.log(err)
      }
    }
  }

}
</script>

<style lang="css" scoped>

</style>
