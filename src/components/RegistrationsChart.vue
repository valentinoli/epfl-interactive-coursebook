<script>
import { Bar } from "vue-chartjs";
import api from "@/services/api";
import { categoricalColors } from "@/d3/colors";

export default {
  extends: Bar,
  name: "RegistrationsChart",
  props: {
    id: String
  },
  watch: {
    id() {
      if (this.$data._chart) {
        this.$data._chart.destroy();
      }
      this.render();
    }
  },
  mounted() {
    if (this.$data._chart) {
      this.$data._chart.destroy();
    }
    this.render();
  },
  methods: {
    getDataCollection() {
      const registrations = api.getCourseRegistrations(this.id);
      const entries = Object.entries(registrations).slice(-6, -1);
      const years = Object.keys(registrations).slice(-6, -1);

      const dataTransformed = entries.flatMap(([year, reg]) => {
        if (!reg) {
          // No registrations for that year
          return [];
        }

        return Object.entries(reg)
          .filter(reg => reg[0] !== "total")
          .map(([program, count]) => ({
            year,
            program,
            count
          }));
      });

      const programs = [
        ...new Set(dataTransformed.map(item => item.program))
      ].sort();

      const datasets = programs.map((program, index) => ({
        label: program,
        hoverBackgroundColor: categoricalColors[index],
        backgroundColor: "#424242",
        borderColor: "#424242",
        data: [],
        borderWidth: 0,
        borderSkipped: "bottom"
      }));

      years.forEach(year => {
        datasets.forEach(({ label, data }) => {
          const found = dataTransformed.find(
            item => item.year === year && item.program === label
          );
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
    getOptions(datasets) {
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
          display: false,
          position: "bottom"
        },
        elements: {
          arc: {
            borderWidth: 0
          }
        },
        segmentShowStroke: false,
        tooltips: {
          enabled: true,
          mode: "single",
          callbacks: {
            beforeTitle: function([{ datasetIndex }]) {
              return datasets[datasetIndex].label;
            },
            label: function({ yLabel }) {
              return `${yLabel} students`;
            }
          },
          displayColors: false
        },
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Registrations per year',
            fontFamily: "'Roboto', sans-serif",
            fontSize: '20',
            fontColor: 'black',
            fontStyle: 'normal'
        }
      };
      return options;
    },
    render() {
      const datacollection = this.getDataCollection();
      const options = this.getOptions(datacollection.datasets);
      this.renderChart(datacollection, options);
      this.styles = { height: "500px" };
    }
  }
};
</script>
<style>
@import url('https://fonts.googleapis.com/css?family=Roboto');
</style>
