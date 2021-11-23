<template lang="html">
  <div id="map-wrap" :style="{ height: '60vh', width: '100%' }">
    <client-only>
      <l-map id="map" :zoom="13" :center="[44.494888,11.342616]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-circle
          v-show="marker"
          :radius="circleRadius"
          :lat-lng="marker ? marker.coordinates : undefined"
        >
          <l-tooltip v-if="marker" ref="activityPopup" class="tooltip" :lat-lng="marker ? marker.coordinates : undefined" :options="{permanent: true, direction: 'top', opacity: 1}">
            <ActivityChart :activity="marker.activity" />
          </l-tooltip>
        </l-circle>
        <l-marker v-for="geoTweet in geoTweets" :key="geoTweet.id" :icon="geoTweet.icon" :lat-lng="geoTweet.geo">
          <l-popup>
            <h2>Tweet by: {{ geoTweet.user.name }}</h2>
            <p> {{ geoTweet.text }} </p>
          </l-popup>
        </l-marker>
      </l-map>
    </client-only>
  </div>
</template>

<script>
import { LMap, LTileLayer, LMarker, LPopup, LCircle } from 'vue2-leaflet'
import ClientOnly from 'vue-client-only'
import { core } from '../common/core'

const isBrowser = typeof window !== 'undefined'
let leaflet
if (isBrowser) {
  leaflet = require('leaflet')
}

export default {
  name: 'Map',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPopup,
    LCircle,
    ClientOnly
  },
  props: {
    activity: Array,
    tweets: Array,
    circleRadius: Number
  },
  data () {
    return {
      marker: Object,
      geoTweets: Array
    }
  },
  watch: {
    async tweets () {
      const filtered = this.tweets.filter(tweet => tweet.place)
      const geoTweets = []
      for (const tweet of filtered) {
        const longLat = await core.getGeo(tweet.place.id)
        if (longLat) {
          tweet.geo = [longLat[1], longLat[0]]
          tweet.icon = leaflet.icon({ iconUrl: tweet.user.profile_image_url, shadowSize: [50, 64], iconSize: [32, 37], iconAnchor: [16, 37] })
          geoTweets.push(tweet)
        }
      }
      this.geoTweets = geoTweets
    }
  },
  created () {
    this.marker = null
    this.geoTweets = []
  },
  methods: {
    async addMarker (event) {
      const coordinates = event.latlng
      const activity = await core.dayTweetCount({ query: `point_radius:[${coordinates.lng} ${coordinates.lat} ${this.circleRadius / 1000}km]` }, new Date())
      this.marker = {
        coordinates: event.latlng,
        activity
      }
      this.$emit('mapClick', { latitude: coordinates.lat, longitude: coordinates.lng })
    }
  }
}
</script>

<style lang="css" scoped>

.tooltip{
  max-width: 13em
}

div {
  color: black;
}
#map {
  z-index: 0;
}
#map-wrap {
  position: relative;
}
#input-group {
  position: absolute;
  top: 0;
  right: 1em;
}
</style>
