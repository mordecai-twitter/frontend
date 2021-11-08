<template lang="html">
  <div id="map-wrap" :style="{ height: '100vh', weight: '50vw' }">
    <client-only>
      <l-map :zoom="13" :center="[44.494888,11.342616]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-marker v-for="(marker,index) in markers" :key="index" :lat-lng="marker" />
      </l-map>
    </client-only>
  </div>
</template>

<script>
import { core } from '../common/core'
export default {
  name: 'Map',
  data () {
    return {
      markers: Array
    }
  },
  created () {
    this.markers = []
  },
  methods: {
    async addMarker (event) {
      this.markers.push(event.latlng)
      const coordinates = event.latlng
      const geocode = 'geocode:' + coordinates.lat + ',' + coordinates.lng + ',' + '5km'
      const tweets = await core.search(geocode)
      // TODO: Passing tweets to a sidebar component to render
      console.log(tweets)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
