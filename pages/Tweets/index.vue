<template lang="html">
  <div>
    <c-flex>
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
        <!-- TODO @Donnoh: disabilita recent quando siamo alla prima pagina. Disabilta temporaneamente i bottoni fino a quando non vengono caricati i tweeet -->
        <br>
        <c-flex w="30em" justify="space-evenly">
          <button v-if="currentPage" type="button" name="button" @click="prevPage">Recent</button>
          <button type="button" name="button" @click="nextPage">Older</button>
        </c-flex>

        <c-flex direction="column">
          <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" />
        </c-flex>
      </c-flex>
    </c-flex>
    <Map @mapClick="displayMapTweets" />
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
