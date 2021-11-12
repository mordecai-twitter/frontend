<template lang="html">
  <div id="map-wrap" :style="{ height: '60vh', width: '100%' }">
    <client-only >
      <l-map id="map" :zoom="13" :center="[44.494888,11.342616]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-circle-marker :radius="circleRadius" v-for="(marker,index) in markers" :key="index" :lat-lng="marker" />
      </l-map>

    </client-only>
    <c-input-group id="input-group" w="20%" size="sm" z-index="200">
      <c-input-left-addon>Radius:</c-input-left-addon>
      <c-input color="black"  type="number" v-model="circleRadius" />
      <c-input-right-addon></c-input-right-addon>
    </c-input-group>
  </div>
</template>

<script>
export default {
  name: 'Map',
  data () {
    return {
      markers: Array,
      circleRadius: Number
    }
  },
  created () {
    this.markers = []
    this.circleRadius = 10
  },
  methods: {
    addMarker (event) {
      this.markers = []
      this.markers.push(event.latlng)
      const coordinates = event.latlng
      const geocode = coordinates.lat + ',' + coordinates.lng + ',' + this.circleRadius + 'km'
      this.$emit('mapClick', geocode)
    }
  }
}
</script>

<style lang="css" scoped>
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
