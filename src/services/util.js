export const specIconPrefix =
  "https://isa.epfl.ch/images/gestacplus/etu/plan_fiche/ic-orientation-";
export const specIconExt = ".gif";

/**
 * Gets an item by key from browser's local storage
 * @param {string} key
 * @returns {string} value associated with key
 */
const item = key => window.localStorage.getItem(key);

/**
 * Capitalizes first character in a string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Replaces underscore in a string with a space
 * @param {string} str
 * @returns {string}
 */
export const replaceUnderscore = str => str.replace(/_/g, " ");

/**
 * Gets an item from browser's local storage
 * and parses it into a JS object.
 * Assumes all data has been loaded into storage
 * @param {string} key
 * @returns {Object} parsed object
 */
export function getItem(key) {
  const val = item(key);

  try {
    return JSON.parse(val);
  } catch (err) {
    console.error(err);
    return {};
  }
}

/**
 * Saves an object in browser's local storage
 * @param {string} key
 * @param {string} val
 */
export function setItem(key, val) {
  window.localStorage.setItem(key, JSON.stringify(val));
}
