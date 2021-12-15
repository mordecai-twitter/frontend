<script>

import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: {
    answers: {
      type: Object,
      required: true
    }
  },
  watch: {
    answers () {
      this.displayGraph()
    }
  },
  mounted () {
    this.displayGraph()
  },
  methods: {
    displayGraph () {
      if (this.answers) {
        this.renderChart(
          {
            labels: Object.keys(this.answers),
            datasets: [
              {
                label: 'Answers',
                backgroundColor: '#f87979',
                data: Object.values(this.answers)
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
