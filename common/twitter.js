import TwitterApi from 'twitter-api-v2'
import config from '../config'

const twitterClient = new TwitterApi(config.twitter.api.bearer_token).readOnly
twitterClient.v2.setPrefix('https://site202137.tw.cs.unibo.it/api/' + twitterClient.v2._prefix)

export {
  twitterClient
}
