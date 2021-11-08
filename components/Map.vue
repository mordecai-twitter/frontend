<template lang="html">
  <div id="map-wrap" style="height: 100vh">
    <client-only>
      <l-map :zoom="13" :center="[55.9464418,8.1277591]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-marker v-for="marker in markers" :key="marker" :lat-lng="marker" />
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
    }
  }
}
</script>

<style lang="css" scoped>
</style>
