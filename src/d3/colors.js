import {
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemeSet1,
  schemeTableau10,
  interpolateCool
} from "d3-scale-chromatic";
import { scaleSequentialQuantile } from "d3-scale";
// all from material color
// https://vuetifyjs.com/en/styles/colors/

const credits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 20, 22, 30];

var creditColor = scaleSequentialQuantile([...credits], interpolateCool);

/*
// code to reverse color range if needed
const interpolator = creditColor.interpolator();
const mirror = t => interpolator(1 - t);
creditColor = creditColor.interpolator(mirror);
*/

var creditColorsHelper = [];

credits.forEach((item, i) => {
  creditColorsHelper.push({
    key: item,
    value: creditColor(i)
  });
});

// import with import {creditColors} from "@/d3/colors";
// use as creditColors[credits].value
export const creditColors = creditColorsHelper;

// import with import {categoricalColors} from "@/d3/colors";
export const categoricalColors = [
  // Slice grey colors
  ...schemeCategory10.slice(0, -3),
  ...schemeDark2.slice(0, -1),
  ...schemePaired,
  ...schemeSet1.slice(0, -1),
  ...schemeTableau10.slice(0, -1)
];

// fall: brown darken-1
// spring: amber darken-1
// fall/spring: cyan darken-1
// inapplicable: blue-grey darken-1
export const semesterColors = {
  Fall: "#6D4C41",
  Spring: "#FFB300",
  "Fall/Spring": "#00ACC1",
  Inapplicable: "#546E7A"
};
