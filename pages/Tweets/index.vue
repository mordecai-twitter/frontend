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
        <c-box>
          <h3>Filters:</h3>
          <c-input
            id="textInput"
            v-model="username"
            pl="1em"
            variant="flushed"
            bg="#16202c"
            type="text"
            placeholder="Insert username here..."
            ml="1em"
            w="97%"
          />
          <c-input
            id="textInput"
            v-model="keyword"
            pl="1em"
            variant="flushed"
            bg="#16202c"
            type="text"
            placeholder="Insert keyword here..."
            ml="1em"
            w="97%"
          />
        </c-box>
        <c-flex>
          <c-checkbox v-model="geoEnable" size="md" variant-color="green">Enable geolocalization</c-checkbox>
        </c-flex>
        <c-button
          id="searchButton"
          variant-color="black"
          type="button"
          name=""
          value="Search"
          @click="search"
          :isDisabled="!(this.keyword || this.username || this.geoEnable)"
        >Search</c-button>
        <Map :tweets="tweets" :circle-radius="geocode.radius * 1000" @mapClick="displayMapTweets" :geoEnable="geoEnable"/>
        <c-slider v-model.number="geocode.radius" :min="1" :max="25" @onChangeEnd="displayMapTweets(undefined)">
          <c-slider-track />
          <c-slider-filled-track />
          <c-slider-thumb />
        </c-slider>
        {{ geocode.radius }} Km
        <c-accordion-item>
          <c-accordion-header>
            <c-box flex="1" text-align="left">
              Other Info:
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
                  <c-tab>Activity Chart</c-tab>
                </c-tab-list>
                <c-tab-panels>
                  <c-tab-panel>
                    <c-flex id="sentimentContainer" direction="column" align="center">
                      <SentimentChart :title="'Tweets'" :labels="['Positive', 'Negative', 'Neutral']" :chartdata="sentiment.chartdata" />
                    </c-flex>
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :id="sentiment.best.tweet.id" :key="sentiment.best.tweet.id" />
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :id="sentiment.worst.tweet.id" :key="sentiment.worst.tweet.id" />
                  </c-tab-panel>
                  <c-tab-panel>
                    <ActivityChart :activity="this.activity"/>
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
            <button
              v-if="tweets.length > 0"
              id="olderButton"
              type="button"
              name="button"
              @click="nextPage"
              >Older</button>
          </c-flex>
          <c-flex justify="flex-end">
              <button
              v-if="currentPage"
              id="recentButton"
              type="button"
              name="button"
              @click="prevPage">Recent</button>
            </c-flex>
        </c-flex>
        <c-flex id="tweetsContainer" direction="column" w="100%" flexWrap>
          <!-- <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" /> -->
          <c-box v-for="tweet in tweets" :key="tweet.id" w="40%" p="4">
            <Tweet :id="tweet.id" ><div class="spinner" /></Tweet>
          </c-box>
        </c-flex>
      </c-flex>
    </c-flex>
  </div>
</template>

<script>
import { CFlex, CInput, CButton, CSpinner, CAccordionPanel, CAccordionHeader, CAccordionIcon, CBox, CAccordionItem, CCheckbox } from '@chakra-ui/vue'
import { Tweet } from 'vue-tweet-embed'
import Map from '../../components/Map'
import { core } from '../../common/core'
import SentimentChart from '../../components/SentimentChart'
import ActivityChart from '../../components/ActivityChart'
export default {
  components: {
    CAccordionItem,
    CCheckbox,
    CBox,
    CSpinner,
    CAccordionPanel,
    CAccordionIcon,
    CAccordionHeader,
    SentimentChart,
    CFlex,
    CInput,
    CButton,
    Map,
    Tweet,
    ActivityChart
  },
  data () {
    return {
      tweets: Array,
      pages: Array,
      currentPage: Number,
      searchType: 'keyword',
      paginator: Object,
      username: '',
      keyword: '',
      geocode: {
        latitude: Number,
        longitude: Number,
        radius: 1
      },
      geoEnable: false,
      sentiment: undefined,
      isLoaded: false,
      isLoading: false,
      searchDisabled: Boolean,
      activity: Object
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPage = 0
    this.geocode.longitude = 11.342616
    this.searchDisabled = true
    this.geocode.latitude = 44.494888
    this.activity = {}
  },
  methods: {
    displayMapTweets (geocode) {
      if (geocode) {
        this.geocode.latitude = geocode.latitude
        this.geocode.longitude = geocode.longitude
      }
    },
    async search () {
      const arg = {
        keyword: this.keyword,
        username: this.username,
        geocode: this.geoEnable ? this.geocode : {}
      }
      this.isLoaded = false
      this.isLoading = true
      // const query = await core.createQueryV1({ ...arg })
      const queryV2 = await core.createQueryV2({ ...arg })
      this.paginator = await core.search(queryV2)
      this.currentPage = 0
      this.tweets = this.paginator.getTweets()
      this.sentiment = (await core.sentiment(queryV2))
      if (this.geoEnable) { this.activity = await core.dayTweetCount({ query: queryV2.query }, new Date()) }
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
