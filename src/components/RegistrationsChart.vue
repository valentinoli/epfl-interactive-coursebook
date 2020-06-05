<script>
import { Bar } from "vue-chartjs";
import api from "@/services/api";
import { categoricalColors } from "@/d3/colors";
import ChartJsPluginDataLabels from "chartjs-plugin-datalabels";

export default {
  extends: Bar,
  name: "RegistrationsChart",
  props: {
    id: String,
    styles: { height: "500px" }
  },
  components: {
    ChartJsPluginDataLabels
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
    this.addPlugin({
      id: "no-data",
      afterDraw: function(chart) {
        if (chart.data.datasets.length === 0) {
          // No data is present
          var ctx = chart.chart.ctx;
          var width = chart.chart.width;
          var height = chart.chart.height;
          chart.clear();

          ctx.save();
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          // ctx.font = "16px normal 'Helvetica Nueue'";
          ctx.fillText(
            "No registrations data available",
            width / 2,
            height / 2
          );
          ctx.restore();
        }
      }
    });

    if (this.$data._chart) {
      this.$data._chart.destroy();
    }
    this.render();
  },
  methods: {
    getDataCollection() {
      const registrations = api.getCourseRegistrations(this.id) || [];
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
        backgroundColor: "#FF5252",
        borderColor: "#ffffff",
        data: [],
        borderWidth: 0.5
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
      let aggData = [0, 0, 0, 0, 0];
      datasets.forEach(item => {
        item.data.forEach((dataPoint, i) => {
          aggData[i] += dataPoint;
        });
      });

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
          text: "Registrations per year",
          fontFamily: "'Roboto', sans-serif",
          fontSize: "20",
          fontColor: "black",
          fontStyle: "500",
          padding: 20
        },
        plugins: {
          datalabels: {
            anchor: "end",
            align: "end",
            offset: 0,
            display: function(context) {
              if (context.datasetIndex == datasets.length - 1) {
                return true;
              } else {
                return false;
              }
            },
            font: {
              family: "'Roboto', sans-serif",
              color: "black",
              weight: "500"
            },
            formatter: function(value, context) {
              //this tells the column
              const column = context.dataIndex;
              return aggData[column];
            }
          }
        }
      };
      return options;
    },
    render() {
      const datacollection = this.getDataCollection();
      const options = this.getOptions(datacollection.datasets);
      this.renderChart(datacollection, options);
    }
  }
};
</script>
<style>
@import url("https://fonts.googleapis.com/css?family=Roboto");
</style>
