<template lang="html">
  <div>
        <c-flex m="2em">
          <c-flex w="50vw" direction="column" justify="left" position="fixed" mt="2em">
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
              type="text"
              placeholder="Insert here some text..."
              ml="1em"
              w="70%"
            />
            <c-input
              v-model="place"
              pl="1em"
              variant="flushed"
              bg="#16202c"
              type="text"
              placeholder="Insert Location Here..."
              ml="1em"
              w="70%"
            />
            <c-button variant-color="black" type="button" name="" value="Search" @click="search">Search</c-button>
            <Map @mapClick="displayMapTweets" />
          </c-flex>
          <c-flex direction="column" align="flex-end" p="3em" w="100%">
            <c-flex w="40%">
              <c-flex justify="flex-start"><button type="button" v-if="this.tweets.length > 0" name="button" @click="nextPage">Older</button></c-flex>

              <c-flex justify="flex-end" w="100%"><button v-if="currentPage" type="button" name="button" @click="prevPage">Recent</button></c-flex>

            </c-flex>
            <c-flex direction="column" w="40%">
              <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" />
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
