<template lang="html">
  <div id="map-wrap" :style="{ height: '60vh', width: '100%' }">
    <client-only>
      <l-map id="map" :zoom="13" :center="[44.494888,11.342616]" @click="addMarker">
        <l-tile-layer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png" />
        <l-circle-marker v-show="marker" :radius="circleRadius" :lat-lng="marker ? marker.coordinates : undefined">
          <l-tooltip v-if="marker" ref="activityPopup" class="tooltip" :lat-lng="marker ? marker.coordinates : undefined" :options="{permanent: true, direction: 'top', opacity: 1}">
            <ActivityChart :tweets="marker.tweets" />
          </l-tooltip>
        </l-circle-marker>
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
export default {
  name: 'Map',
  props: {
    activity: Array
  },
  data () {
    return {
      marker: Object,
      circleRadius: Number
    }
  },
  created () {
    this.marker = null
    this.circleRadius = 10
  },
  methods: {
    addMarker (event) {
      this.marker = {
        coordinates: event.latlng,
        tweets: [{ created_at: '2/1/2013 7:37:08 AM' },
          { created_at: '2/1/2013 12:37:08 AM' },
          { created_at: '2/1/2013 11:37:08 AM' },
          { created_at: '2/1/2013 15:37:08 AM' }]
      }

      const coordinates = event.latlng
      const geocode = coordinates.lat + ',' + coordinates.lng + ',' + this.circleRadius + 'km'
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
