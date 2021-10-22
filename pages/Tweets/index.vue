<template lang="html">
  <div class="">
    <h2>Tweets:</h2>
    <Tweet v-for="tweet in tweets" :key="tweet.id" :tweet="tweet" />
  </div>
</template>

<script>
import Tweet from '../../components/Tweet'
export default {
  components: {
    Tweet
  },
  data () {
    return {
      tweets: Array
    }
  },
  async created () {
    const config = {
      headers: {
        Accept: 'application/json'
      }
    }
    try {
      let res = await fetch('https://icanhazdadjoke.com/search', config)
      res = await res.json()
      this.tweets = res.results
    } catch (err) {
      console.log(err)
    }
  }
}
</script>

<style lang="css" scoped>

</style>
