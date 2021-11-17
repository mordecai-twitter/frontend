<template lang="html">
  <div>
    <c-flex m="2em" id="wrapper">
      <c-flex
      id="search"
      direction="column"
      justify="left"
      mt="2em"
      wrap="wrap"
      minWidth="20em">
        <c-form-control w="100%">
          <c-select v-model="searchType" bg="#16202c" placeholder="Search by">
            <option value="keyword">Keyword</option>
            <option value="user">User</option>
          </c-select>
        </c-form-control>
        <c-box>
            <c-input
          v-model="query"
          pl="1em"
          variant="flushed"
          bg="#16202c"
          type="text"
          placeholder="Insert here some text..."
          ml="1em"
          w="97%"
            />
            <c-input
            v-model="place"
            pl="1em"
            variant="flushed"
            bg="#16202c"
            type="text"
            placeholder="Insert Location Here..."
            ml="1em"
            w="97%"
            />
        </c-box>
        <c-button variant-color="black" type="button" name="" value="Search" @click="search">Search</c-button>
        <Map :tweets="tweets" @mapClick="displayMapTweets" />
      </c-flex>
      <c-flex direction="column" p="1em">
        <c-flex>
          <c-flex justify="flex-start"><button v-if="tweets.length > 0" type="button" name="button" @click="nextPage">Older</button></c-flex>
          <c-flex justify="flex-end" w="100%"><button v-if="currentPage" type="button" name="button" @click="prevPage">Recent</button></c-flex>
        </c-flex>
        <c-flex direction="column">
          <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet"/>
        </c-flex>
      </c-flex>
    </c-flex>
  </div>
</template>

<script>
import Tweet from '../../components/Tweet'
import Map from '../../components/Map'
import { core } from '../../common/core'
export default {
  components: {
    Map,
    Tweet
  },
  data () {
    return {
      tweets: Array,
      pages: Array,
      currentPage: Number,
      searchType: 'keyword',
      paginator: Object,
      query: '',
      place: ''
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPage = 0
  },
  methods: {
    async displayMapTweets (geocode) {
      console.log(geocode)
      this.paginator = await core.search(this.query, { geocode })
      this.tweets = this.paginator.getTweets()
    },
    async search () {
      if (this.searchType === 'keyword') {
        this.paginator = await core.search(this.query, {}, this.place)
      } else {
        this.paginator = await core.userTimeline(this.query)
      }
      this.tweets = this.paginator.getTweets()
    },
    async prevPage () {
      this.currentPage = await this.paginator.prev()
      this.tweets = this.paginator.getTweets()
    },
    async nextPage () {
      this.currentPage = await this.paginator.next()
      this.tweets = this.paginator.getTweets()
    }
  }
}
</script>

<style>
#search {
    flex-shrink: 0;
    flex-basis: 50%;
}
@media only screen and (max-width: 900px) {
  #wrapper {
      /* it place the items in vertical direction */
    flex-direction: column;
  }
}
</style>
