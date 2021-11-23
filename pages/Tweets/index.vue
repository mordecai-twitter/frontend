<template lang="html">
  <div>
    <c-flex id="wrapper" m="2em">
      <c-flex
        id="search"
        direction="column"
        justify="left"
        mt="2em"
        wrap="wrap"
        min-width="20em"
      >
        <c-form-control w="100%">
          <c-select id="searchTypesSelect" v-model="searchType" bg="#16202c" placeholder="Search by">
            <option value="keyword">Keyword</option>
            <option value="user">User</option>
          </c-select>
        </c-form-control>
        <c-box>
          <c-input
            id="textInput"
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
        <c-button
          id="searchButton"
          variant-color="black"
          type="button"
          name=""
          value="Search"
          @click="search"
        >Search</c-button>
        <Map :tweets="tweets" @mapClick="displayMapTweets" />

        <c-accordion-item>
          <c-accordion-header>
            <c-box flex="1" text-align="left">
              Sentiment analysis:
            </c-box>
            <c-accordion-icon />
          </c-accordion-header>
          <c-accordion-panel pb="4" align="center">
            <h3 v-if="!sentiment && !isLoading">Please make a search...</h3>
            <CSpinner
              v-if="isLoading"
              thickness="4px"
              speed="0.65s"
              empty-color="gray.200"
              color="blue.500"
              size="xl"
            />
            <c-box v-if="isLoaded" w="600px">
              <c-tabs>
                <c-tab-list>
                  <c-tab>Graph</c-tab>
                  <c-tab>Best Tweet</c-tab>
                  <c-tab>Worst Tweet</c-tab>
                </c-tab-list>
                <c-tab-panels>
                  <c-tab-panel>
                    <c-flex id="sentimentContainer" direction="column" align="center">
                      <SentimentChart :title="'Tweets'" :labels="['Positive', 'Negative', 'Neutral']" :chartdata="sentiment.chartdata" />
                    </c-flex>
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :key="sentiment.best.tweet.id_str" :tweet="sentiment.best.tweet" />
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :key="sentiment.worst.tweet.id_str" :tweet="sentiment.worst.tweet" />
                  </c-tab-panel>
                </c-tab-panels>
              </c-tabs>
            </c-box>
          </c-accordion-panel>
        </c-accordion-item>
      </c-flex>
      <c-flex direction="column" p="1em">
        <c-flex>
          <c-flex justify="flex-start">
            <button v-if="tweets.length > 0" id="olderButton" type="button" name="button" @click="nextPage">Older</button>
          </c-flex>
          <c-flex justify="flex-end" w="100%">
            <button v-if="currentPage" id="recentButton" type="button" name="button" @click="prevPage">Recent</button>
          </c-flex>
        </c-flex>
        <c-flex id="tweetsContainer" direction="column">
          <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" />
        </c-flex>
      </c-flex>
    </c-flex>
  </div>
</template>

<script>
import { CFlex, CFormControl, CSelect, CInput, CButton, CSpinner, CAccordionPanel, CAccordionHeader, CAccordionIcon, CBox, CAccordionItem, CInputRightAddon } from '@chakra-ui/vue'
import Tweet from '../../components/Tweet'
import Map from '../../components/Map'
import { core } from '../../common/core'
import SentimentChart from '../../components/SentimentChart'
export default {
  components: {
    CAccordionItem,
    CBox,
    CSpinner,
    CAccordionPanel,
    CAccordionIcon,
    CAccordionHeader,
    SentimentChart,
    CFlex,
    CFormControl,
    CSelect,
    CInput,
    CButton,
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
      place: '',
      sentiment: undefined,
      isLoaded: false,
      isLoading: false
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPage = 0
  },
  methods: {
    async displayMapTweets (geocode) {
      // console.log(geocode)
      this.paginator = await core.search(this.query, { geocode })
      this.tweets = this.paginator.getTweets()
    },
    async search () {
      this.isLoaded = false
      this.isLoading = true
      if (this.searchType === 'keyword') {
        this.paginator = await core.search(this.query, {}, this.place)
      } else {
        this.paginator = await core.userTimeline(this.query)
      }
      this.tweets = this.paginator.getTweets()
      this.sentiment = (await core.sentiment({ query: `${this.query}` }))
      if (this.sentiment) {
        this.isLoaded = true
      }
      this.isLoading = false
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
