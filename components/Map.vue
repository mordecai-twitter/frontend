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
    addMarker (event) {
      this.markers.push(event.latlng)
      const coordinates = event.latlng
      const geocode = coordinates.lat + ',' + coordinates.lng + ',' + '10km'
      this.$emit('mapClick', geocode)
    }
  }
}
</script>

<style lang="css" scoped>
</style>
