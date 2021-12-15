<script>

import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    activity: []
  },
  data () {
    return {
      stepSize: Number
    }
  },
  watch: {
    activity () {
      this.displayGraph()
    }
  },
  mounted () {
    this.displayGraph()
  },
  methods: {
    displayGraph () {
      if (this.activity) {
        this.renderChart(
          {
            labels: [...Array(24).keys()],
            datasets: [
              {
                label: 'Activity',
                backgroundColor: '#f87979',
                data: this.activityHistogram(this.activity)
              }
            ]
          },
          {
            responsive: true,
            maintainAspectRatio: true,
            legend: {
              labels: {
                fontColor: 'white'
              }
            },
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true,
                    min: 0,
                    fontColor: 'white'
                  }
                }
              ],
              xAxes: [
                {
                  ticks: {
                    fontColor: 'white'
                  }
                }
              ]
            }
          }
        )
      }
    },
    activityHistogram (activity) {
      const histogram = [...Array(24).keys()].map(() => 0)
      for (const timeSlot of activity) {
        const hour = new Date(timeSlot.start).getHours()
        histogram[hour] += timeSlot.tweet_count
      }
      return histogram
    }
  }
}

</script>
<style>
</style>
