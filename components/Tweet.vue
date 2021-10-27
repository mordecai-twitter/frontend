
<template>
  <nuxt-link :to="'tweets/' + tweet.id">
    <c-box class="tweet" p="1em" border-color="#8898a5" border-width="1px" w="40em" m="0.5em" rounded="lg" bg="#16202c" color="white">
      <p><span v-html="highlightedTweet"></span></p>
    </c-box>
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
  },
  computed: {
    highlightedTweet: function() {
      let hashReg = /(\$[A-Z]+)|((#|@)\w+)|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gm;
      let tw = (this.tweet.text).toString()
      tw = (tw).replace(hashReg, "<span class='blue'>$&</span>")
      console.log(tw)
      return tw
    }

  }
}
</script>

<style>
.blue {
  color: #1d9bf0
}
</style>
