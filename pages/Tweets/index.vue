<template lang="html">
  <div class="">
    <h2>Tweets:</h2>
    <input v-model="query" type="text" placeholder="Insert here some text...">
    <input type="button" name="" value="Search" @click="search">
    <br>
    <button v-if="currentPageIndex !== 0" type="button" name="button" @click="prevPage">Recent</button>
    <input
      id="hashtag"
      v-model="searchType"
      type="radio"
      selected
      name="searchType"
      value="hashtag"
    >
    <label for="hashtag">Hashtag</label>
    <br>
    <input
      id="user"
      v-model="searchType"
      type="radio"
      name="searchType"
      value="user"
    >
    <label for="user">User</label>
    <br>
    <input id="keyWord" v-model="searchType" type="radio" name="searchType" value="keyWord">
    <label for="keyWord">Key Word</label>
    <br>
    <button type="button" name="button" @click="nextPage">Older</button>
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
      tweets: Array,
      pages: Array,
      currentPageIndex: Number,
      searchType: 'hashtag',
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
      if (this.searchType === 'hashtag') {
        this.query = '#' + this.query
      }
      try {
        let page, user
        if (this.searchType !== 'user') {
          page = await twitterClient.v2.search(this.query, { 'media.fields': 'url' })
        } else {
          user = await twitterClient.v2.userByUsername(this.query)
          const userId = user.data.id
          page = await twitterClient.v2.userTimeline(userId, { exclude: 'replies' })
        }
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
