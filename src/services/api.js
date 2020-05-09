import getObject from "./aws";
import {
  capitalize,
  replaceUnderscore,
  getItem,
  setItem,
  specIconPrefix,
  specIconExt
} from "./util";

/**
 * Fetch data from AWS and load it into browser's local storage
 */
async function loadAllData() {
  // Fetch data from AWS
  const data = await getObject("master.json");

  // Cache data in localStorage
  Object.entries(data).forEach(([key, val]) => {
    setItem(key, val);
  });

  // Store the courses as an array of objects too
  // to have two different formats for convenience (and performance?)
  const coursesObject = getItem("courses");

  // Object of key: Object pairs --> Array of Objects
  const coursesArray = Object.entries(coursesObject).map(([id, v]) => ({
    id,
    ...v
  }));

  setItem("coursesArray", coursesArray);
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
 * Gets a course by id
 * @param {String} id
 * @returns {Object} matched course
 */
function getCourseById(id) {
  const coursesObject = getItem("courses");
  return {
    id,
    ...coursesObject[id]
  };
}

/**
 * Gets course info for all given course ids
 * @param {Array} ids - course ids
 * @returns {Array} filtered array of course Objects
 */
const getCoursesByIds = ids => {
  const coursesArray = getItem("coursesArray");

  if (!ids) {
    // All courses if ids is not provided
    return coursesArray;
  }
  return coursesArray.filter(({ id }) => ids.includes(id));
};

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
 * Gets course info by given parameters
 * @param {String} level - academic level
 * @param {String} program - study program
 * @param {String} masterspec - specialization (level needs to be "master")
 * @param {String} section - EPFL section
 * @param {String} credits - number of credits
 * @param {String} semester -
 * @returns {Array} matching courses, array of [id, value] pairs, where value is Object
 */
function getCourses({
  selectedLevel: level = "",
  selectedProgram: program = "",
  selectedMasterspec: masterspec = "",
  selectedSection: section = "",
  selectedCredits: credits = "",
  selectedSemester: semester = ""
} = {}) {
  const prefiltered = getPrefilteredCourses(level, program, masterspec);
  const filtered = prefiltered.filter(c => {
    return (
      (!section || c.section === section) &&
      (!credits || c.credits === credits) &&
      (!semester || c.semester === semester)
    );
  });
  return filtered;
}

/**
 * Gets filtering options for independent course filtering dropdown lists
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
 * Gets all dependency links of courses for the network
 * @returns {Array} Array of Objects representing edges, each with properties source and target
 */
function getLinks() {
  return getItem("links");
}

export default {
  loadAllData,
  getAllLevels,
  getProgramsByLevel,
  getMasterspecsByProgram,
  getCourseById,
  getCourses,
  getCourseFilterOptions,
  getLinks
};
