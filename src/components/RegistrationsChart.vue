<script>
import { Bar } from "vue-chartjs";
import api from "@/services/api";
import colors from "@/d3/colors";

export default {
  extends: Bar,
  name: "RegistrationsChart",
  props: {
    id: String
  },
  mounted() {
    console.log("mounted");
    const datacollection = this.getDataCollection();
    const options = this.getOptions();
    this.renderChart(datacollection, options);
  },
  methods: {
    getDataCollection() {
      // mapping key:value to {year: key, registrations: value}
      const registrations = api.getCourseRegistrations(this.id);
      const entries = Object.entries(registrations).slice(-6, -1);
      const years = Object.keys(registrations).slice(-6, -1);

      const dataTransformed = entries.flatMap(([year, reg]) => {
        if (!reg) {
          // No registrations for that year
          return [];
        }

        return Object.entries(reg).filter(reg => reg[0] !== "total").map(([program, count]) => ({
          year,
          program,
          count
        }));
      });

      const programs = [...new Set(dataTransformed.map(item => item.program))].sort();

      const datasets = programs.map((program, index) => ({
        label: program,
        backgroundColor: colors[index],
        data: []
      }));

      years.forEach(year => {
        datasets.forEach(({ label, data }) => {
          const found = dataTransformed.find(item => item.year === year && item.program === label);
          if (!found) {
            data.push(0);
          } else {
            data.push(found.count);
          }
        });
      });

      const datacollection = {
        labels: years,
        datasets
      };
      return datacollection;
    },
    getOptions() {
      const options = {
        scales: {
          yAxes: [
            {
              stacked: true,
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
              stacked: true,
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
          display: true,
          position: "bottom"
        },
        tooltips: {
          enabled: true,
          mode: "single",
          callbacks: {
            title: function([ item ], data) {
              console.log(item, data);
            },
            label: function(tooltipItems) {
              console.log(tooltipItems);
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
  }
};
</script>
