<template lang="html">
  <c-flex direction="column" m="2em" align="center">
    <c-flex w="60em" justify="center">
      <c-form-control>
        <c-select v-model="searchType" bg="#16202c" placeholder="Search by">
          <option value="keyword">Keyword</option>
          <option value="user">User</option>
        </c-select>
      </c-form-control>
      <c-input
        v-model="query"
        pl="1em"
        variant="flushed"
        bg="#16202c"
        w="35%"
        type="text"
        placeholder="Insert here some text..."
        ml="1em"
      />
      <c-input
        v-model="place"
        pl="1em"
        variant="flushed"
        bg="#16202c"
        w="35%"
        type="text"
        placeholder="Insert Location Here..."
        ml="1em"
      />
      <c-button variant-color="black" type="button" name="" value="Search" @click="search">Search</c-button>
    </c-flex>
    <br>
    <!-- <c-flex w="30em" justify="space-evenly">
      <button v-if="currentPageIndex !== 0" type="button" name="button" @click="prevPage">Recent</button>
      <button type="button" name="button" @click="nextPage">Older</button>
    </c-flex> -->

    <c-flex direction="column">
      <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" />
    </c-flex>
  </c-flex>
</template>

<script>
import Tweet from '../../components/Tweet'
import { core } from '../../common/core'
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
      query: '',
      place: ''
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPageIndex = 0
  },
  methods: {
    async search () {
      const tweetsResponse = await core.search(this.query)
      this.tweets = tweetsResponse
    }
  }

}
</script>
