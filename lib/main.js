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
function createLitCelebration(name, rank) {
  return {
    name: name,
    rank: rank,
  };
}

/**
  * Returns a list of celebrations for a given date. As seasons and dates are computed, they are stored in the cache
  * if it is provided. This makes subsequent requests faster.
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
  cache ??= {};

  // Get the date as it was at midnight UTC. That way timestamps are UTC canonical (ie. they can be shared without a timezone)
  // After this, all date.get<>() called should use the .getUTC<>() variantes
  date = utcDate(date);

  let cels = cacheRead(cache, date);

  const createTemp = (n, r) => createLitCelebration(n, r, 'temporal');
  const createSanc = (n, r) => createLitCelebration(n, r, 'sanctoral');

  // If we compute the temporal feasts, compuet all for the season
  if (!cels.some(el => el.cycle === 'temporal')) {
    const easterDate = computeEasterGregorian(date.getUTCFullYear());

    const goodFridayDate = new Date(easterDate);
    goodFridayDate.setUTCDate(goodFridayDate.getUTCDate() - 2);

    const pentecostDate = new Date(easterDate);
    pentecostDate.setUTCDate(easterDate.getUTCDate() + 49);

    const christmasDate = utcDate(date.getUTCFullYear(), 11, 25);

    const adventStartDate = new Date(christmasDate);
    adventStartDate.setUTCDate(
      adventStartDate.getUTCDate() - adventStartDate.getUTCDay() - 21);

    const epiphanyDate = utcDate(date.getUTCFullYear(), 0, 1);
    epiphanyDate.setUTCDate(epiphanyDate.getUTCDate() - epiphanyDate.getUTCDay() + 7);

    const baptismDate = new Date(epiphanyDate);
    baptismDate.setUTCDate(baptismDate.getUTCDate() + 7);

    const ashWedDate = new Date(easterDate);
    ashWedDate.setUTCDate(ashWedDate.getUTCDate() - 46);

    if (date.getUTCMonth() === 11 && date.getUTCDate() === 25) {
      cacheWrite(cache, date, createTemp('Christmas Day', 2));
    }

    if (date <= baptismDate) { // Christmas of this litYear
      cacheWrite(cache, epiphanyDate, createTemp('The Epiphany of the Lord', 2));
      cacheWrite(cache, baptismDate, createTemp('The Baptism of the Lord', 5));
    } else if (baptismDate < date && date < ashWedDate || // Ordinary Time
        pentecostDate < date && date < adventStartDate) {
      const millisInDay = 24 * 60 * 60 * 1000;
      const millisInWeek = 7 * millisInDay;
      let diff = ashWedDate.getTime() - baptismDate.getTime();
      const numWeeksOT1 = Math.ceil(diff / millisInWeek);
      // we add one day in case `date` is a Sunday
      diff = date.getTime() + millisInDay - pentecostDate.getTime();
      const weekInOT2 = numWeeksOT1 + Math.ceil(diff / millisInWeek) + 1;
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const name = `${weekInOT2}th ${dayNames[date.getUTCDay()]} in Ordinary Time`;
      cacheWrite(cache, date, createTemp(name, date.getUTCDay() === 0 ? 6 : 13));
    } else if (ashWedDate <= date && date < goodFridayDate) { // Lent
    } else if (goodFridayDate <= date && date < easterDate) { // Paschal Triduum
    } else if (easterDate <= date && date <= pentecostDate) { // Easter
      cacheWrite(cache, easterDate, createTemp("Easter Sunday", 1));
    } else if (adventStartDate <= date && date < christmasDate) { // Advent of next litYear
    } else if (christmasDate <= date) { // Christmas of next litYear
    } else {
      // TODO handle this error... when would this happen? would indicate programming error no? not user error
      throw new Error('unexpected invalid date');
    }

  }

  // If we compute the sanctoral feasts, compute all of them for the year, because they can
  // sometimes jump from one season to the next if they collide.
  if (!cels.some(el => el.cycle === 'sanctoral')) {
    if (date.getUTCMonth() === 6 && date.getUTCDate() === 25) {
      cacheWrite(cache, date, createSanc("Saint James, Apostle", 7));
    }
  }

  cels = cacheRead(cache, date);

  //TODO handle solemnities that move (see point 60 https://www.liturgyoffice.org.uk/Calendar/Info/Days.shtml)
  // basically we have to precompute more. how much more? 1 day before/after? 1 week? more? What guarantees correctness?
    // or maybe just compute all solemnities
  // better solution: when you fetch a celebration, compute the whole season. Then, we know that if there are celebrations in the date already, we don't need to compute anything.
  const minRank = cels.map(c => c.rank).reduce((a, b) => b === 12 ? a : Math.min(a, b), 999);
  cels = cels.filter(c => c.rank <= minRank);

  if (!cels || !cels.length) throw new Error("date unavailable");

  return cels;
}

function cacheRead(cache, date) {
  // cels is an Object in the cache, so we turn it into an Array
  return Object.values(
    cache?.
    ['y' + date.getUTCFullYear()]?.
    [date.getUTCMonth()]?.
    [date.getUTCDate() - 1] ?? {}
  );
}

function cacheWrite(cache, date, cels) {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const ykey = 'y' + y;
  cache[ykey] ??= []; // months
  cache[ykey][m] ??= []; // dates
  cache[ykey][m][d - 1] ??= {}; // celebrations
  if (!Array.isArray(cels)) cels = [cels];
  for (const cel of cels)
    cache[ykey][m][d - 1][cacheKey(cel)] = cel;
}

function cacheKey(cel) {
  return cel.name.toLowerCase().replace(/\s/g, "_");
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
