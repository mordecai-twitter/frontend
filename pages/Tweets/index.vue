<template lang="html">
  <c-flex direction="column" m="2em" align="center">
    <c-flex w="60em" justify="center">
      <c-form-control>
        <c-select v-model="searchType" bg="#16202c" placeholder="Search by">
          <option value="keyword">Keyword</option>
          <option value="user">User</option>
          <option value="hashtag">Hashtag</option>
        </c-select>
      </c-form-control>
      <c-input
        v-model="query"
        pl="1em"
        variant="flushed"
        bg="#16202c"
        w="50%"
        type="text"
        placeholder="Insert here some text..."
      />
      <c-button variant-color="black" type="button" name="" value="Search" @click="search">Search</c-button>
    </c-flex>
    <br>
    <c-flex w="30em" justify="space-evenly">
      <button v-if="currentPageIndex !== 0" type="button" name="button" @click="prevPage">Recent</button>
      <button type="button" name="button" @click="nextPage">Older</button>
    </c-flex>

    <c-flex direction="column">
      <Tweet v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
    </c-flex>
  </c-flex>
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
      searchType: 'keyword',
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
      let query = this.query
      try {
        let page, user
        if (this.searchType === 'hashtag') {
          query = '#' + query
        }
        if (this.searchType !== 'user') {
          page = await twitterClient.v2.search(query, { 'media.fields': 'url' })
        } else {
          user = await twitterClient.v2.userByUsername(query)
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
