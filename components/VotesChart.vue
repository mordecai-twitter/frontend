<script>

import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    votes: {
      type: Array,
      required: true
    },
    maxColumns: {
      type: Number,
      default: 10
    }
  },
  watch: {
    votes () {
      this.displayGraph()
    }
  },
  mounted () {
    this.displayGraph()
  },
  methods: {
    displayGraph () {
      if (this.votes) {
        // TODO eliminare questo console log orrendo
        // console.log(this.votes)
        // console.log(
        //   this.votes.reduce((res, vote) => ({
        //     ...res, [vote.name]: vote.count
        //   }), {}))
        this.renderChart(
          {
            labels: this.votes.map(vote => vote.name).slice(0, this.maxColumns),
            datasets: [
              {
                label: 'Votes',
                backgroundColor: '#f87979',
                data: this.votes.map(vote => vote.count)
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
    }
  }
}

</script>
<style>
</style>
