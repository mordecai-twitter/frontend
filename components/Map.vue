<template lang="html">
  <div id="map-wrap" :style="{ height: '60vh', width: '100%' }">
    <client-only>
      <l-map id="map" :zoom="13" :center="[marker.coordinates.lat, marker.coordinates.lng]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-circle
          v-if="geoEnable"
          v-show="marker"
          :radius="circleRadius"
          :lat-lng="marker ? marker.coordinates : ''"
        />
        <l-marker v-for="geoTweet in geoTweets" :key="geoTweet.id" :icon="geoTweet.icon" :lat-lng="geoTweet.geo.coordinates.coordinates">
          <l-popup>
            <h2>Tweet by: {{ geoTweet.user.username }}</h2>
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
    LCircle,
    LPopup,
    ClientOnly
  },
  props: {
    tweets: Array,
    circleRadius: Number,
    geoEnable: Boolean
  },
  data () {
    return {
      marker: Object,
      geoTweets: Array
    }
  },
  watch: {
    async tweets () {
      console.log(this.tweets)
      const geoTweets = []
      for (const tweet of this.tweets) {
        if (tweet.geo) {
          const userInfo = await core.getUserInfo(tweet.author_id)
          tweet.user = userInfo.data
          tweet.icon = leaflet.icon({ iconUrl: userInfo.data.profile_image_url, shadowSize: [50, 64], iconSize: [32, 37], iconAnchor: [16, 37] })
          if (!tweet.geo.coordinates) {
            const longLat = await core.getGeo(tweet.geo.place_id)
            if (longLat) {
              longLat[0] = longLat[0] + this.getRandomArbitrary(-0.0005, 0.0005)
              longLat[1] = longLat[1] + this.getRandomArbitrary(-0.0005, 0.0005)
              tweet.geo.coordinates = {
                coordinates: longLat.reverse()
              }
              geoTweets.push(tweet)
            }
          } else {
            const longLat = tweet.geo.coordinates.coordinates
            tweet.geo.coordinates = {
              coordinates: longLat.reverse()
            }
            geoTweets.push(tweet)
          }
        } else {
          console.log('Non localizzato')
        }
      }
      this.geoTweets = geoTweets
    }
  },
  created () {
    this.marker = {
      coordinates: {
        lat: 44.494888,
        lng: 11.342616
      }
    }
    this.geoTweets = []
  },
  methods: {
    getRandomArbitrary (min, max) {
      return Math.random() * (max - min) + min
    },
    addMarker (event) {
      const coordinates = event.latlng
      this.marker = {
        coordinates
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
