<template lang="html">
  <div class="">
    <h2>Tweets:</h2>
    <input v-model="query" type="text" placeholder="Insert here some text...">
    <input type="button" name="" value="Search" @click="search">
    <Tweet v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
    <button v-if="currentPageIndex !== 0" type="button" name="button" @click="prevPage">Recent</button>
    <button type="button" name="button" @click="nextPage">Older</button>
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
      pages: Array,
      currentPageIndex: Number,
      query: ''
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPageIndex = 0
  },
  methods: {
    async search () {
      this.tweets = []
      this.pages = []
      this.currentPageIndex = 0
      console.log(this.query)
      try {
        const page = await twitterClient.v2.search(this.query, { 'media.fields': 'url' })
        // const res = await twitterClient.v2.userTimeline('12', { exclude: 'replies' })
        this.pages.push(page)
        this.tweets = this.pages[this.currentPageIndex].tweets
      } catch (err) {
        console.log(err)
      }
    },
    async nextPage () {
      try {
        this.currentPageIndex = this.currentPageIndex + 1
        if (this.currentPageIndex > this.pages.length - 1) {
          const res = await this.pages[this.currentPageIndex - 1].next()
          this.pages.push(res)
        }
        this.tweets = this.pages[this.currentPageIndex].tweets
      } catch (err) {
        console.log(err)
      }
    },
    prevPage () {
      try {
        if (this.currentPageIndex > 0) {
          this.currentPageIndex = this.currentPageIndex - 1
          this.tweets = this.pages[this.currentPageIndex].tweets
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

}
</script>

<style lang="css" scoped>

</style>
