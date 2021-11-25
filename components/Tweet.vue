<template>
  <div>
    <c-box
      id="tweetBox"
      class="tweet"
      p="1em"
      border-color="#8898a5"
      border-width="1px"
      m="0.5em"
      rounded="lg"
      bg="#16202c"
      color="white"
    >
      <c-heading as="h3" size="sm">{{ tweet.user.name }}
        <span class="tag"> @{{ tweet.user.screen_name }}</span>
        <c-tag v-if="tweet.geo != null" size="sm" ml="1em">geo'd by tweet</c-tag>
      </c-heading>
      <p><span class="content" v-html="highlightedTweet" /></p>
      <p class="date">{{ tweet.created_at }}</p>
    </c-box>
  </div>
</template>

<script>
import { CBox, CHeading } from '@chakra-ui/vue'

export default {
  name: 'Tweet',
  components: {
    CBox, CHeading
  },
  props: {
    tweet: {
      required: true,
      type: Object
    }
  },
  computed: {
    highlightedTweet () {
      const hashReg = /(\$[A-Z]+)|((#|@)\w+)|(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*))/gm
      let tw = (this.tweet.text).toString()
      tw = (tw).replace(hashReg, "<span class='blue'>$&</span>")
      return tw
    }
  },
  created () {
    // console.log(this.tweet)
  }
}
</script>

<style>
.blue {
  color: #1d9bf0
}
.tag {
    color: #a1a1a1;
    margin-left: 0.5em;
    font-weight: 400;
}
.date {
    color: #a1a1a1;
    margin-left: 0.5em;
    font-size: 0.9em;
    text-align: right;
    margin-bottom: -0.5em
}
</style>
