<script>

import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: ['tweets'],
  mounted () {
    console.log('Data: ', this.tweets)
    this.renderChart(
      {
        labels: [...Array(24).keys()],
        datasets: [
          {
            label: 'Activity',
            backgroundColor: '#f87979',
            data: this.activityHistogram(this.tweets)
          }
        ]
      },
      {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              }
            }
          ]
        }
      })
  },
  methods: {
    activityHistogram (tweets) {
      const histogram = [...Array(24).keys()].map(() => 0)
      for (const tweet of tweets) {
        const hour = new Date(tweet.created_at).getHours()
        histogram[hour]++
      }
      return histogram
    }
  }
}

</script>
<style>
</style>
