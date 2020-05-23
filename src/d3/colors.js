import {
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemeSet1,
  schemeTableau10
} from "d3-scale-chromatic";

export default [
  // Slice grey colors
  ...schemeCategory10.slice(0, -3),
  ...schemeDark2.slice(0, -1),
  ...schemePaired,
  ...schemeSet1.slice(0, -1),
  ...schemeTableau10.slice(0, -1)
];
