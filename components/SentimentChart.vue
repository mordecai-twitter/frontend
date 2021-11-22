
<script>
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: {
    title: {
      type: String
    },
    labels: {
      type: Array
    },
    chartdata: {
      type: Array,
      default: null
    },
    options: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      gradient: Array,
      gradient2: Array
    }
  },
  mounted () {
    this.renderChart({
      labels: this.labels,
      datasets: [{
        label: this.title,
        data: this.chartdata,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        pointBackgroundColor: 'white',
        borderWidth: 1,
        pointBorderColor: 'white',
        backgroundColor: [
          'rgb(50,205,50)',
          'rgba(255, 0, 0, 0.8)',
          'rgb(255, 205, 86)'
        ]
      }]
    }, {
      tooltips: {
        callbacks: {
          label (tooltipItem, data) {
            return data.labels[tooltipItem.index] + ': ' + data.datasets[0].data[tooltipItem.index] + '%'
          }
        }
      },
      legend: {
        labels: {
          fontColor: 'White',
          fontSize: 18
        }
      }
    }
    )
  }
}

</script>
