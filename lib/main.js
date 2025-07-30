// TODO
// provide date in ISO format yyyymmdd
// return the list of celebrations for that day
// or return an error "date unavailable"
// TODO
// assume SF Archdiocese
// get all the celebrations
// - figure out the source of truth for liturgical calendars in my archdiocese.
  // - Can it be derived? or do I just wait for its yearly publication?


/**
 * @typedef {Object} LitCelebration
 * @property {string} name
 */


/** creates a LitCelebration. */
function createLitCelebration() {
  return {
    name: "foo",
  };
}

/**
  * Returns a list of celebrations for a given date
  * @param {Date} date - the date for which celebrations are sought
  * @returns {LitCelebration[]}
  */
function getCelebrations(date) {
  throw new Error("date unavailable");
}

export { getCelebrations };
