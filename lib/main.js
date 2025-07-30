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
  *
  * @param {Object} [cache] - the cache of celebrations (optional)
  * @param {Date} date - the date for which celebrations are sought
  *
  * @also
  *
  * @param {Object} [cache] - the cache (optional)
  * @param {number} y - the year
  * @param {number} m - the month (0-indexed)
  * @param {number} d - the date (1-indexed)
  *
  * @returns {LitCelebration[]}
  */
function getCelebrations(cache, _y, _m, _d) {
  let date = new Date(_y, _m, _d);
  if (arguments.length === 1) {
    date = cache;
    cache = null;
  } else if (arguments.length === 2) {
    date = _y;
  } else if (arguments.length === 3) {
    date = new Date(cache, _y, _m);
    cache = null;
  }

  // Get the date as it was at midnight UTC. That way timestamps are UTC canonical (ie. they can be shared without a timezone)
  // After this, all date.get<>() called should use the .getUTC<>() variantes
  date = utcDate(date);

  // cache lookup
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const ykey = `y${y}`;
  let cachedMonth = cache?.[ykey]?.[m];
  let cels = cachedMonth?.[d - 1];
  if (cels?.length) return cels;
  // cache lookup failed

  cels = [];

  const easterDate = computeEasterGregorian(date.getUTCFullYear());
  if (easterDate.getTime() === date.getTime()) {
    cels.push({ name: "Easter" });
  }

  if (!cels.length) throw new Error("date unavailable");

  if (cache != null) {
    cachedMonth ??= [];
    cachedMonth[d - 1] = cels;
    cache[ykey] ??= [];
    cache[ykey][m] = cachedMonth;
  }

  return cels;
}

/**
 * Returns the date of easter for a given year.
 *   The algorithm is based on the following website:
 *   https://en.wikipedia.org/wiki/Date_of_Easter#Anonymous_Gregorian_algorithm
 *   using the New Scientist correction.
 *   Also reference https://www.codeproject.com/Articles/10860/Calculating-Christian-Holidays when calculating holidays
 * @param year
 * @return {Date}
 */
function computeEasterGregorian(year) {
	const a = year % 19,
		b = Math.floor(year / 100),
		c = year % 100,
		d = Math.floor(b / 4),
		e = b % 4,
		g = Math.floor((8 * b + 13) / 25),
		h = (19 * a + b - d - g + 15) % 30,
		i = Math.floor(c / 4),
		k = c % 4,
		l = (32 + 2 * e + 2 * i - h - k) % 7,
		m = Math.floor((a + 11 * h + 19 * l) / 433),
		month = Math.floor((h + l - 7 * m + 90) / 25),
		day = (h + l - 7 * m + 33 * month + 19) % 32
	return utcDate(year, month - 1, day)
}

// pass in year,month,date or a Date object
function utcDate(y, m, d) {
  if (m === undefined) {
    return new Date(Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()));
  }
  return new Date(Date.UTC(y, m, d));
}

export { getCelebrations };
