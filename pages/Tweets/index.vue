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
          <CTagLabel>
            Username
            <c-input
              id="textInputUsername"
              v-model="username"
              pl="1em"
              variant="flushed"
              bg="#16202c"
              type="text"
              placeholder="Insert username here..."
              ml="1em"
              w="97%"
            />
          </CTagLabel>
          <CTagLabel>
            Keyword
            <c-input
              id="textInputKeyword"
              v-model="keyword"
              pl="1em"
              variant="flushed"
              bg="#16202c"
              type="text"
              placeholder="Insert keyword here..."
              ml="1em"
              w="97%"
            />
          </CTagLabel>
        </c-box>
        <c-flex>
          <c-checkbox v-model="geoEnable" size="md" variant-color="green">Enable geolocalization</c-checkbox>
        </c-flex>
        <c-flex>
          <c-checkbox v-model="onlyGeolocalized" size="md" variant-color="green">Show only geolocalized Tweets</c-checkbox>
        </c-flex>
        <c-button
          id="searchButton"
          name="searchButton"
          variant-color="black"
          type="button"
          value="Search"
          :isDisabled="!(keyword || username || geoEnable)"
          @click="search"
        >Search</c-button>
        <c-button
          v-if="!isStreaming"
          id="streamButton"
          variant-color="black"
          type="button"
          value="Stream"
          :isDisabled="!username && !keyword"
          @click="stream"
        >Stream</c-button>
        <c-button
          v-if="isStreaming"
          id="abortButton"
          variant-color="black"
          type="button"
          value="Abort"
          @click="abort"
        >Abort</c-button>
        <Map :tweets="tweets" :circle-radius="geocode.radius * 1000" :geoEnable="geoEnable" @mapClick="displayMapTweets" />
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
                  <c-tab v-if="geoEnable">Activity Chart</c-tab>
                  <c-tab>Term Cloud</c-tab>
                </c-tab-list>
                <c-tab-panels>
                  <c-tab-panel>
                    <c-flex id="sentimentContainer" direction="column" align="center">
                      <SentimentChart id="sentimentChart" :title="'Tweets'" :labels="['Positive', 'Negative', 'Neutral']" :chartdata="sentiment.chartdata" />
                    </c-flex>
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :id="sentiment.best.tweet.id" :key="sentiment.best.tweet.id" />
                  </c-tab-panel>
                  <c-tab-panel align="left">
                    <Tweet :id="sentiment.worst.tweet.id" :key="sentiment.worst.tweet.id" />
                  </c-tab-panel>
                  <c-tab-panel v-if="geoEnable">
                    <ActivityChart :activity="activity" />
                  </c-tab-panel>
                  <c-tab-panel id="termcloudContainer">
                    <TermCloud :words="termcloud" @onWordClick="onTermCloudWordClick" />
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
              @click="prevPage"
            >Recent</button>
          </c-flex>
        </c-flex>
        <c-flex id="tweetsContainer" direction="column" w="100%" flex-wrap>
          <!-- <Tweet v-for="tweet in tweets" :key="tweet.id_str" :tweet="tweet" /> -->
          <c-box v-for="tweet in tweets" :key="(tweet.id_str || tweet.id)" p="4">
            <Tweet :id="tweet.id_str || tweet.id" />
          </c-box>
        </c-flex>
      </c-flex>
    </c-flex>
  </div>
</template>

<script>
import {
  CFlex, CInput, CButton, CSpinner, CAccordionPanel, CAccordionHeader, CAccordionIcon,
  CBox, CAccordionItem, CCheckbox, CSliderFilledTrack, CSliderThumb, CSliderTrack, CSlider, CTabs, CTabList, CTab, CTabPanel, CTabPanels, CTagLabel
} from '@chakra-ui/vue'
import { getPreciseDistance } from 'geolib'
import { Tweet } from 'vue-tweet-embed'
import Map from '../../components/Map'
import { core } from '../../common/core'
import SentimentChart from '../../components/SentimentChart'
import ActivityChart from '../../components/ActivityChart'
import TermCloud from '../../components/TermCloud'
import { QueryDirector, V2Builder } from '../../common/query'
export default {
  components: {
    CAccordionItem,
    CCheckbox,
    CBox,
    CSpinner,
    CAccordionPanel,
    CAccordionIcon,
    CAccordionHeader,
    CSliderFilledTrack,
    CSliderThumb,
    CSliderTrack,
    CSlider,
    CTabs,
    CTabList,
    CTab,
    CTabPanel,
    CTabPanels,
    SentimentChart,
    CFlex,
    CInput,
    CButton,
    TermCloud,
    Map,
    Tweet,
    ActivityChart,
    CTagLabel
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
      termcloud: undefined,
      isLoaded: false,
      isLoading: false,
      isStreaming: false,
      searchDisabled: Boolean,
      activity: Object,
      termWord: Array,
      onlyGeolocalized: false
    }
  },
  created () {
    this.tweets = []
    this.pages = []
    this.currentPage = 0
    this.geocode.longitude = 11.342616
    this.searchDisabled = true
    this.geocode.latitude = 44.494888
    this.activity = []
    this.termWord = []
  },
  methods: {
    displayMapTweets (geocode) {
      if (geocode) {
        this.geocode.latitude = geocode.latitude
        this.geocode.longitude = geocode.longitude
      }
    },
    async search () {
      this.tweets = []
      const director = new QueryDirector(new V2Builder())
      const arg = {
        keyword: this.onlyGeolocalized ? this.keyword.concat(' has:geo') : this.keyword,
        username: this.username,
        geocode: this.geoEnable ? this.geocode : undefined
      }
      const v2query = director.makeSearchQuery(arg.keyword, arg.username, arg.geocode).get()
      this.isLoaded = false
      this.isLoading = true
      this.paginator = await core.search(v2query)
      this.currentPage = 0
      this.tweets = this.paginator.getTweets()
      this.sentiment = (await core.sentiment(v2query))
      this.termcloud = await core.termcloud(v2query)
      if (this.geoEnable) {
        this.activity = await core.dayTweetCount({ query: v2query.query }, new Date())
      }
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
    },
    async onTermCloudWordClick (word) {
      this.keyword = word[0]
      await this.search()
    },
    stream () {
      this.tweets = []
      const query = {}

      if (!(this.username || this.keyword)) {
        console.log('Tweet streams require specifying at least a username or a keyword.')
        return
      }

      if (this.geoEnable) {
        // Convert to bounding box
        // Approximation: if r is the radius, the
        // rounded up approximation is [-r, r], while
        // the rounded down approximation is [-r/sqrt(2), r/sqrt(2)]
        // We use the mean of these two approximations.

        const maxRadius = this.geocode.radius
        const approximateRadius = (maxRadius + maxRadius / Math.sqrt(2)) / 2

        // Since Earth isn't a perfect sphere, the actual distance between two
        // coordinates depends on where they are
        const approximationStep = 0.1

        // getPreciseDistance returns the distance in metres
        const latitudeToKm = getPreciseDistance(
          { latitude: this.geocode.latitude, longitude: this.geocode.longitude },
          { latitude: this.geocode.latitude + approximationStep, longitude: this.geocode.longitude }
        ) / (approximationStep * 1000)

        const longitudeToKm = getPreciseDistance(
          { latitude: this.geocode.latitude, longitude: this.geocode.longitude },
          { latitude: this.geocode.latitude, longitude: this.geocode.longitude + approximationStep }
        ) / (approximationStep * 1000)

        // Convert from kms to longitude and latitude
        const latitudeRadius = approximateRadius / latitudeToKm
        const longitudeRadius = approximateRadius / longitudeToKm

        const top = this.geocode.latitude + latitudeRadius
        const bottom = this.geocode.latitude - latitudeRadius
        const left = this.geocode.longitude - longitudeRadius
        const right = this.geocode.longitude + latitudeRadius

        query.locations = `${left},${bottom},${right},${top}`
      }

      if (this.username) {
        query.user = this.username
      }

      if (this.keyword) {
        query.keywords = this.keyword
      }

      this.isStreaming = true
      core.stream(query, (tweet) => {
        console.log(tweet)
        tweet.geo = { place_id: tweet.place.id }
        tweet.author_id = tweet.user.id_str
        if (this.tweets.length > 30) {
          this.tweets.pop()
        }
        tweet.id = tweet.id.toString()
        this.tweets.unshift(tweet)
      }, () => {
        this.isStreaming = false
      })
    },
    abort () {
      this.isStreaming = false
      core.abortStream()
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
