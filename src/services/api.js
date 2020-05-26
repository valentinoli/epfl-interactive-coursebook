import getObject from "./aws";
import {
  capitalize,
  replaceUnderscore,
  getItem,
  setItem,
  specIconPrefix,
  specIconExt
} from "./util";

function isDataLoaded() {
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

/**
 * Fetch data from AWS and load it into browser's local storage
 */
async function loadAllData() {
  const loaded = isDataLoaded();

  // Remove deprecated coursesArray key to avoid QuotaExceededError
  window.localStorage.removeItem("coursesArray");

  if (!loaded) {
    // Clear local storage before loading
    window.localStorage.clear();

    // Fetch data from AWS
    const data = await getObject("master.json");

    // Cache data in localStorage
    Object.entries(data).forEach(([key, val]) => {
      setItem(key, val);
    });

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

/**
 * Get all academic levels, to display in a dropdown list
 * @returns {Array} array of objects, each representing a level
 */
function getAllLevels() {
  const programsItem = getItem("programs");
  const levels = Object.keys(programsItem);
  const optionElements = levels.map(l => ({
    value: l,
    text: capitalize(replaceUnderscore(l))
  }));
  return optionElements;
}

/**
 * Get all study programs for a given academic level, to display in a dropdown list
 * @param {String} level - the given academic level
 * @returns {Array} array of objects, each representing a program
 */
function getProgramsByLevel(level) {
  if (!level) {
    return [];
  }
  const programsItem = getItem("programs");
  const optionElements = Object.keys(programsItem[level]);

  // value and text attributes for option elements are equal
  // so no need to map the keys to { value, text } objects
  return optionElements;
}

/**
 * Get all specializations for a given master's programs, to display in a dropdown list
 * @param {String} program - the master's program
 * @returns {Array} array of objects, each representing a specialization
 */
function getMasterspecsByProgram(program) {
  const masterspecsItem = getItem("masterspecs");
  if (program in masterspecsItem) {
    // return specs if program has specs
    const { spec_key } = masterspecsItem[program];

    const optionElements = Object.entries(spec_key).map(([key, val]) => ({
      value: key,
      text: val,
      iconUrl: `${specIconPrefix}${key}${specIconExt}`
    }));
    return optionElements;
  }

  return [];
}

/**
 * Gets dropdown options for global course filters
 * @param {Array} courses - currently displayed courses, array of [id, value] pairs, where value is Object
 * @returns {Object} object of arrays of distinct values for selected shared properties of all the courses
 */
function getCourseFilterOptions(courses) {
  const sections = Array.from(new Set(courses.map(c => c.section))).sort();
  const credits = Array.from(new Set(courses.map(c => c.credits))).sort(
    (a, b) => a - b
  );
  const semesters = Array.from(new Set(courses.map(c => c.semester)));
  return { sections, credits, semesters };
}

/**
 * Gets all global course filter options
 * @returns {Object}
 */
function getAllCourseFilterOptions() {
  return getCourseFilterOptions(getCoursesByIds());
}

/**
 * Gets a course by id
 * @param {String} id
 * @returns {Object} matched course
 */
function getCourseById(id) {
  const coursesArray = getItem("courses");
  return coursesArray.find(c => c.id === id);
}

/**
 * Gets course info for all given course ids
 * @param {Array} ids - course ids
 * @returns {Array} filtered array of course Objects
 */
function getCoursesByIds(ids) {
  const coursesArray = getItem("courses");

  if (!ids) {
    // All courses if ids is not provided
    return coursesArray;
  }
  return coursesArray.filter(({ id }) => ids.includes(id));
}

function getPrefilteredCourses(level, program, masterspec) {
  if (masterspec && level !== "master") {
    throw new Error(`
      The academic level needs to be master when selecting a specialization
    `);
  }

  // All master's programs with specializations
  const masterProgramsWithSpecs = Object.keys(getItem("masterspecs"));

  if (!level) {
    // All courses
    return getCoursesByIds();
  } else if (!program) {
    // All courses for the given level
    const programsItem = getItem("programs");
    const programs = programsItem[level];
    const coursesArrays = Object.values(programs);
    const courseIds = [].concat(...coursesArrays);
    return getCoursesByIds(courseIds);
  } else if (!masterProgramsWithSpecs.includes(program) || level !== "master") {
    // All courses for the given level and program returned without
    // specializations info if the program does not have any or level is not master
    const programsItem = getItem("programs");
    const courseIds = programsItem[level][program];
    return getCoursesByIds(courseIds);
  } else {
    // Program has specializations, fetch course ids from masterspecs object
    const masterspecsItem = getItem("masterspecs");

    const {
      spec_key,
      specs: coursesPerSpec,
      courses: specsPerCourse
    } = masterspecsItem[program];

    let courseIds;
    if (!masterspec) {
      // No specialization selected, return all courses
      courseIds = Object.keys(specsPerCourse);
    } else {
      // Masterspec was selected, retrieve list of courses from specs object
      courseIds = coursesPerSpec[masterspec];
    }

    const courses = getCoursesByIds(courseIds);

    const specsPerCourseWithInfo = Object.fromEntries(
      Object.entries(specsPerCourse).map(([k, v]) => [
        // v is an array of all spec ids for course k
        // we map each [k, v] entry to [k, Object]
        // and then create an Object {k: Object} from the resulting entries
        k,
        {
          // each entry value is mapped to an Object {specs: Array(Object)}
          specs: v.map(id => ({
            id,
            name: spec_key[id],
            iconUrl: `${specIconPrefix}${id}${specIconExt}`
          }))
        }
      ])
    );

    // specsPerCourseWithInfo contains all courses for the program,
    // but we only want to keep those for the selected specialization
    const coursesWithSpecInfo = courses.map(course =>
      Object.assign(course, specsPerCourseWithInfo[course.id])
    );

    return coursesWithSpecInfo;
  }
}

/**
 * Gets all dependency links of courses for the network
 * @param {Array} ids - ids of courses which match the filter criteria
 * @returns {Array} Array containing three Arrays:
 * 1. links between the courses that match the filter criteria, i.e. subgraph
 * 2. ingoing links of the subgraph
 * 3. outgoing links of the subgraph
 */
function getLinks(ids) {
  const linksArray = getItem("links");
  return linksArray.reduce(
    ([subgraph, ingoing, outgoing], link) => {
      if (ids.includes(link.source) && ids.includes(link.target)) {
        // Between nodes in the subgraph
        return [[...subgraph, link], ingoing, outgoing];
      } else if (!ids.includes(link.source) && ids.includes(link.target)) {
        // Ingoing links do not have the source node in the subgraph
        return [subgraph, [...ingoing, link], outgoing];
      } else if (ids.includes(link.source) && !ids.includes(link.target)) {
        // Outgoing links do not have the target node in the subgraph
        return [subgraph, ingoing, [...outgoing, link]];
      } else {
        // Not a match
        return [subgraph, ingoing, outgoing];
      }
    },
    [[], [], []]
  );
}

/**
 * Returns the links and neighborhood nodes based on subgraph node ids
 * @param {Array} ids - subgraph ids
 * @returns {Object} Object containing five Arrays:
 * links of subgraph, ingoing, and outgoing subgraph neighborhoods,
 * nodes of ingoing and outgoing subgraph neighborhoods
 */
function getLinksAndNeighborhoods(ids) {
  const [subgraphLinks, ingoingLinks, outgoingLinks] = getLinks(ids);

  const ingoingNodes = getCoursesByIds(
    ingoingLinks.map(({ source }) => source)
  ).map(n => ({ ...n, ingoingNeighbor: true, outgoingNeighbor: false }));
  const outgoingNodes = getCoursesByIds(
    outgoingLinks.map(({ target }) => target)
  ).map(n => ({ ...n, ingoingNeighbor: false, outgoingNeighbor: true }));

  // Some nodes might be part of both the ingoing and outgoing neighborhoods
  // and we want to avoid rendering them twice later on (see CourseViz.vue)
  ingoingNodes.forEach(ingoing => {
    outgoingNodes.forEach(outgoing => {
      if (ingoing.id === outgoing.id) {
        ingoing.ingoingNeighbor = true;
        ingoing.outgoingNeighbor = true;
        outgoing.ingoingNeighbor = true;
        outgoing.outgoingNeighbor = true;
      }
    });
  });

  return {
    ingoingNodes,
    outgoingNodes,
    subgraphLinks,
    ingoingLinks,
    outgoingLinks
  };
}

/**
 * Gets course info by given parameters
 * @param {String} level - academic level
 * @param {String} program - study program
 * @param {String} masterspec - specialization (level needs to be "master")
 * @param {String} section - EPFL section
 * @param {String} credits - number of credits
 * @param {String} semester -
 * @returns {Array} subgraph nodes
 */
function getSubgraphNodes({
  selectedLevel: level = "",
  selectedProgram: program = "",
  selectedMasterspec: masterspec = "",
  selectedSection: section = "",
  selectedCredits: credits = "",
  selectedSemester: semester = ""
} = {}) {
  const prefiltered = getPrefilteredCourses(level, program, masterspec);
  const subgraphNodes = prefiltered.filter(
    c =>
      (!section || c.section === section) &&
      (!credits || c.credits === credits) &&
      (!semester || c.semester === semester)
  );

  const nodes = subgraphNodes.map(n => ({
    ...n,
    ingoingNeighbor: false,
    outgoingNeighbor: false
  }));
  return nodes;
}

function getCourseRegistrations(id) {
  const isa = getItem("isa");
  return isa[id];
}

export default {
  loadAllData,
  getAllLevels,
  getProgramsByLevel,
  getMasterspecsByProgram,
  getCourseFilterOptions,
  getAllCourseFilterOptions,
  getCourseById,
  getLinksAndNeighborhoods,
  getSubgraphNodes,
  getCourseRegistrations
};
