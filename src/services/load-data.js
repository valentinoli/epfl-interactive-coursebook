import getObject from "./aws";
import { getItem, setItem } from "./util";

// Pattern: <version-num-on-date>_<dd.MM.yyyy>
const LATEST_VERSION_DATE = "2_26.05.2020";

function isDataUpdated() {
  // Checks if the data is up to date
  const date = getItem("latestVersionDate");
  return date === LATEST_VERSION_DATE;
}

function isDataLoaded() {
  // Checks if all keys from the master.json
  // are present in the local storage
  const keys = [
    "studyplans",
    "links",
    "isa",
    "courses",
    "programs",
    "masterspecs"
  ];

  return keys.reduce((acc, key) => acc && key in localStorage, true);
}

async function fetchData() {
  if (process.env.NODE_ENV === "production") {
    // Fetch data from AWS in production
    return await getObject("master.json");
  }

  // In development we fetch the data from the public/ directory
  const response = await fetch("master.json");
  const data = await response.json();
  return data;
}

/**
 * Fetch data from AWS and load it into browser's local storage
 */
export default async function loadAllData() {
  const loaded = isDataLoaded();
  const updated = isDataUpdated();

  if (!loaded || !updated) {
    // Clear local storage before loading
    window.localStorage.clear();

    const data = await fetchData();

    // Cache data in localStorage
    Object.entries(data).forEach(([key, val]) => {
      setItem(key, val);
    });

    // Save an identifier for the latest version of the data
    setItem("latestVersionDate", LATEST_VERSION_DATE);

    const courses = getItem("courses");
    const links = getItem("links");

    // Add ingoing and outgoing neighbor fields
    Object.values(courses).forEach(val => {
      val.ingoing = [];
      val.outgoing = [];
    });

    // Populate ingoing and outgoing neighbors
    links.forEach(({ source, target }) => {
      const sourceCourse = courses[source];
      const targetCourse = courses[target];
      sourceCourse.outgoing.push({ id: target, name: targetCourse.name });
      targetCourse.ingoing.push({ id: source, name: sourceCourse.name });
    });

    // Object of key: Object pairs --> Array of Objects
    const coursesArray = Object.entries(courses)
      .map(([id, v]) => ({
        id,
        ...v
      }))
      .sort((a, b) => (a.name > b.name ? 1 : -1));

    setItem("courses", coursesArray);
  }
}
