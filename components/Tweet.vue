
<template>
  <nuxt-link :to="'tweets/' + tweet.id">
    <div class="tweet">
      <p>{{ tweet.text }}</p>
    </div>
  </nuxt-link>
</template>

<script>
export default {
  name: 'Tweet',
  props: {
    tweet: {
      required: true,
      type: Object
    }
  }
}
</script>

<style>
.tweet {
  padding: 1rem;
  border: 1px dotted #ccc;
  margin: 1rem 0;
}
</style>
