<script>
import {Bar} from "vue-chartjs";
export default {
  extends: Bar,
  name: "RegistrationsChart",
  props: {
    registrations: Object
  },
  methods: {
    getDataCollection() {
      //mapping key:value to {year: key, registrations: value}
      let data = [];
      var element = {};
      Object.entries(this.registrations).forEach(item => {
        element = {};
        element.year = item[0];
        element.registrations = item[1];
        data.push(element);
      });
      data = data.slice(-6, -1);

      const years = data.map(d => d.year);
      const registrations = data.map(d => d.registrations);

      const datacollection = {
        labels: years,
        datasets: [
          {
            label: "Registrations per year",
            backgroundColor: "#7979f8",
            pointBackgroundColor: "white",
            borderWidth: 1,
            pointBorderColor: "#249EBF",
            data: registrations
          }
        ]
      };
      return datacollection;
    },
    getOptions() {
      const options = {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: true
              }
            }
          ],
          xAxes: [
            {
              ticks: {
                beginAtZero: true
              },
              gridLines: {
                display: false
              }
            }
          ]
        },
        legend: {
          display: true
        },
        tooltips: {
          enabled: true,
          mode: "single",
          callbacks: {
            label: function(tooltipItems) {
              return tooltipItems.yLabel + " students";
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        height: 200
      };
      return options;
    }
  },
  mounted() {
    const datacollection = this.getDataCollection();
    const options = this.getOptions();
    this.renderChart(datacollection, options);
  }
};
</script>
