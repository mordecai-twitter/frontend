<template>
  <div>
    <nuxt-link to="/tweets">
      Back To Tweets
    </nuxt-link>
    <h2>{{ tweet.joke }}</h2>
    <hr>
    <small>Tweet ID: {{ $route.params.id }}</small>
  </div>
</template>

<script>
export default {
  data () {
    return {
      tweet: {}
    }
  },
  async created () {
    const config = {
      headers: {
        Accept: 'application/json'
      }
    }
    try {
      let res = await fetch(
        `https://icanhazdadjoke.com/j/${this.$route.params.id}`,
        config
      )
      res = await res.json()
      this.tweet = res
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style>
</style>
