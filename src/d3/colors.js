import {
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemeSet1,
  schemeTableau10
} from "d3-scale-chromatic";
import * as d3 from "d3";

const credits = [0,1,2,3,4,5,6,7,8,9,10,12,13,14,20,22,30];
const creditRange = d3.scaleLinear().domain([0,16]).range(['#FFCDD2','#B71C1C'])

var creditColorsHelper = [];

credits.forEach((item, i) => {
  creditColorsHelper.push({
    key:   item,
    value: creditRange(i)
  });
});

//import with import {creditColors} from "@/d3/colors";
//use as creditColors[credits].value
export const creditColors = creditColorsHelper;

//import with import {programColors} from "@/d3/colors";
//use as creditColors[credits].value
export const programColors = [// Slice grey colors
    ...schemeCategory10.slice(0, -3),
    ...schemeDark2.slice(0, -1),
    ...schemePaired,
    ...schemeSet1.slice(0, -1),
    ...schemeTableau10.slice(0, -1)
  ];
