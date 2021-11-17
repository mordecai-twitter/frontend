<template lang="html">
  <div id="map-wrap" :style="{ height: '60vh', width: '100%' }">
    <client-only>
      <l-map id="map" :zoom="13" :center="[44.494888,11.342616]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-circle-marker
          v-show="marker"
          :radius="circleRadius"
          :lat-lng="marker ? marker.coordinates : undefined"
        >
          <!--<l-tooltip v-if="marker" ref="activityPopup" class="tooltip" :lat-lng="marker ? marker.coordinates : undefined" :options="{permanent: true, direction: 'top', opacity: 1}">
            <ActivityChart :tweets="marker.tweets" />
          </l-tooltip>-->
        </l-circle-marker>
        <l-marker v-for="geoTweet in geoTweets" :key="geoTweet.id" :icon="geoTweet.icon" :lat-lng="geoTweet.geo">
          <l-popup>
            <h2>Tweet by: {{ geoTweet.user.name }}</h2>
            <p> {{ geoTweet.text }} </p>
          </l-popup>
        </l-marker>
      </l-map>
    </client-only>
    <c-input-group id="input-group" w="20%" size="sm" z-index="200">
      <c-input-left-addon>Radius:</c-input-left-addon>
      <c-input v-model.number="circleRadius" color="black" type="number" />
      <c-input-right-addon />
    </c-input-group>
  </div>
</template>

<script>

import { icon } from 'leaflet'
import { core } from '../common/core'

export default {
  name: 'Map',
  props: {
    activity: Array,
    tweets: Array
  },
  data () {
    return {
      marker: Object,
      circleRadius: Number,
      geoTweets: Array
    }
  },
  watch: {
    async tweets () {
      const filtered = this.tweets.filter(tweet => tweet.place)
      console.log(filtered)
      for (const tweet of filtered) {
        const longLat = await core.getGeo(tweet.place.id)
        console.log(tweet.place)
        tweet.geo = [longLat[1], longLat[0]]
        tweet.icon = icon({ iconUrl: tweet.user.profile_image_url, shadowSize: [50, 64], iconSize: [32, 37], iconAnchor: [16, 37] })
      }
      this.geoTweets = filtered
    }
  },
  created () {
    this.marker = null
    this.circleRadius = 10
    console.log(this.geoTweets)
  },
  methods: {
    addMarker (event) {
      const coordinates = event.latlng
      const geocode = coordinates.lat + ',' + coordinates.lng + ',' + this.circleRadius + 'km'
      this.marker = {
        coordinates: event.latlng,
        tweets: [] // await core.dayTweet('', { geocode }, new Date())
      }
      this.$emit('mapClick', geocode)
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
  right: 0;
}
</style>
