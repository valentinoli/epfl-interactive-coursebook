<script>
import Chart from "chart.js";
import api from "@/services/api";
import { categoricalColors } from "@/d3/colors";

import { Bar } from "vue-chartjs";
import ChartJsPluginDataLabels from "chartjs-plugin-datalabels";

const fontFamily = "'Roboto', sans-serif";

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

    Chart.defaults.global.defaultFontFamily = fontFamily;

    if (this.$data._chart) {
      this.$data._chart.destroy();
    }
    this.render();
  },
  methods: {
    getChartData() {
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

      const totalPerYear = entries.flatMap(item => {
        if (!item[1]) {
          return [0];
        }

        return item[1].total;
      });

      const programs = [
        ...new Set(dataTransformed.map(item => item.program))
      ].sort();

      const datasets = programs.map((program, index) => ({
        label: program,
        hoverBackgroundColor: categoricalColors[index],
        backgroundColor: "#FF5252",
        borderColor: "#ffffff",
        borderWidth: 0.5,
        data: []
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

      const chartData = {
        labels: years,
        datasets
      };
      return { chartData, totalPerYear };
    },
    getOptions({ datasets }, totalPerYear) {
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
            beforeTitle: ([{ datasetIndex }]) => datasets[datasetIndex].label,
            label: ({ yLabel }) =>
              ` ${yLabel} student${yLabel === 1 ? "" : "s"}`,
            labelColor: ({ datasetIndex }) => ({
              borderColor: "#fff",
              backgroundColor: datasets[datasetIndex].hoverBackgroundColor
            })
          },
          displayColors: true,
          titleFontFamily: fontFamily,
          bodyFontFamily: fontFamily,
          footerFontFamily: fontFamily
        },
        responsive: true,
        maintainAspectRatio: false,
        title: {
          display: true,
          text: "Registrations per year",
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
            display: context => context.datasetIndex === datasets.length - 1,
            font: {
              weight: "500"
            },
            formatter: (value, context) => {
              // Return the column count (total per year)
              const { dataIndex: yearIndex } = context;
              return totalPerYear[yearIndex];
            }
          }
        }
      };
      return options;
    },
    render() {
      const { chartData, totalPerYear } = this.getChartData();
      const options = this.getOptions(chartData, totalPerYear);
      this.renderChart(chartData, options);
    }
  }
};
</script>
<style>
@import url("https://fonts.googleapis.com/css?family=Roboto");
</style>
