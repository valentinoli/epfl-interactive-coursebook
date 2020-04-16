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
 * If the item doesn't exist, the user is alerted and page is reloaded.
 * @param {string} key
 * @returns {Object} parsed object
 */
export function getItem(key) {
  const val = item(key);

  if (!val) {
    window.alert(
      "This site relies on your browser's local storage and needs to be refreshed"
    );
    window.location.reload();
  }

  try {
    return JSON.parse(val);
  } catch (err) {
    console.error(err);
    return {};
  }
}
