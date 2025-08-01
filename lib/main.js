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
  }
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
  let date = new Date(_y, _m, _d)
  if (arguments.length === 1) {
    date = cache
    cache = null
  } else if (arguments.length === 2) {
    date = _y
  } else if (arguments.length === 3) {
    date = new Date(cache, _y, _m)
    cache = null
  }
  cache ??= {}

  // Get the date as it was at midnight UTC. That way timestamps are
  // UTC canonical (ie. they can be shared without a timezone)
  // After this, all date.get<>() calls should use the .getUTC<>() variants
  date = utcDate(date)

  let cels = cacheRead(cache, date)

  const createTemp = (n, r) => createLitCelebration(n, r, 'temporal')
  const createSanc = (n, r) => createLitCelebration(n, r, 'sanctoral')

  // If we compute the temporal feasts, compute all for the season
  if (!cels.some(el => el.cycle === 'temporal')) {
    const easterDate = computeEasterGregorian(date.getUTCFullYear())
    const goodFridayDate = createOffsetDate(easterDate, -2)
    const pentecostDate = createOffsetDate(easterDate, 49)
    const christmasDate = utcDate(date.getUTCFullYear(), 11, 25)
    const adventStartDate = createOffsetDate(christmasDate,
      -christmasDate.getUTCDay() - 21)
    const epiphanyDate = utcDate(date.getUTCFullYear(), 0, 1)
    incrDate(epiphanyDate, -epiphanyDate.getUTCDay() + 7)
    const baptismDate = createOffsetDate(epiphanyDate, 7)
    const ashWedDate = createOffsetDate(easterDate, -46)

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday']
    const getDayName = d => dayNames[d.getUTCDay()]
    const mkSundayName = (w, s) => `${w}${
      10 < w && w < 20 ? 'th' : // w <=34, so it's safe to ignore 112th, 1311th, etc.
      w % 10 === 1 ? 'st' :
      w % 10 === 2 ? 'nd' :
      w % 10 === 3 ? 'rd' :
      'th'
    } Sunday ${s}`
    const mkWeekdayName = (d, w, s) => `${getDayName(d)} of week ${w} ${s}`

    // we cacheWrite all celebrations in the Season the event is in
    if (date <= baptismDate) { // Christmas of this litYear
      const cursor = utcDate(date.getUTCFullYear(), 0, 2)
      for (;cursor.getUTCDay() !== 0; incrDate(cursor))
        cacheWrite(cache, cursor, createTemp('Christmas Weekday', 13))
      cacheWrite(cache, cursor, createTemp('The Epiphany of the Lord', 2))
      incrDate(cursor)
      if (cursor.getUTCDate() === 8 || cursor.getUTCDate() === 9) {
        cacheWrite(cache, cursor, createTemp('The Baptism of the Lord', 5))
      } else {
        for (;cursor.getUTCDay() !== 0; incrDate(cursor)) {
          const name = getDayName(cursor) + ' after Epiphany Sunday'
          cacheWrite(cache, cursor, createTemp(name, 13))
        }
        cacheWrite(cache, cursor, createTemp('The Baptism of the Lord', 5))
      }
    } else if (baptismDate < date && date < ashWedDate || // Ordinary Time
        pentecostDate < date && date < adventStartDate) {
      let cursor = createOffsetDate(baptismDate, 1)
      let week = 1
      const s = 'in Ordinary Time'
      for (;cursor < ashWedDate; incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, s), 6))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, s), 13))
        }
      }
      week = 35
      cursor = createOffsetDate(adventStartDate, -1)
      for (;cursor > pentecostDate; incrDate(cursor, -1)) {
        if (cursor.getUTCDay() === 6) {
          week--
        } 
        if (cursor.getUTCDay() === 0) {
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, s), 6))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, s), 13))
        }
      }
    } else if (ashWedDate <= date && date < goodFridayDate) { // Lent
      const cursor = new Date(ashWedDate)
      incrDate(cursor)
      for (; cursor.getUTCDay() > 0; incrDate(cursor)) {
        const name = `${getDayName(cursor)} after Ash Wednesday`
        cacheWrite(cache, cursor, createTemp(name, 9))
      }
      let week = 0
      const s = 'of Lent'
      for (;cursor < createOffsetDate(easterDate, -7); incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, s), 2))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, s), 9))
        }
      }
      cacheWrite(cache, cursor, createTemp("Palm Sunday of the Lord's Passion", 2))
      incrDate(cursor)
      for (; cursor.getUTCDay() < 4; incrDate(cursor))
        cacheWrite(cache, cursor, createTemp(`${getDayName(cursor)} of Holy Week`, 2))
      cacheWrite(cache, cursor, createTemp('Holy Thursday', 2))
      //console.log('cache');console.dir(cache, { depth: 10 })
    } else if (goodFridayDate <= date && date < easterDate) { // Paschal Triduum
    } else if (easterDate <= date && date <= pentecostDate) { // Easter
      cacheWrite(cache, easterDate, createTemp('Easter Sunday', 1))
    } else if (adventStartDate <= date && date < christmasDate) { // Advent of next litYear
    } else if (christmasDate <= date) { // Christmas of next litYear
      cacheWrite(cache, date, createTemp('Christmas Day', 2))
    } else {
      throw new Error('invalid program state; invalid date')
    }

  }

  // If we compute the sanctoral feasts, compute all of them for the year, because they can
  // sometimes jump from one season to the next if they collide.
  if (!cels.some(el => el.cycle === 'sanctoral')) {
    if (date.getUTCMonth() === 6 && date.getUTCDate() === 25) {
      cacheWrite(cache, date, createSanc('Saint James, Apostle', 7))
    }
  }

  cels = cacheRead(cache, date)

  //TODO handle solemnities that move (see point 60 https://www.liturgyoffice.org.uk/Calendar/Info/Days.shtml)
  // basically we have to precompute more. how much more? 1 day before/after? 1 week? more? What guarantees correctness?
    // or maybe just compute all solemnities
  // better solution: when you fetch a celebration, compute the whole season. Then, we know that if there are celebrations in the date already, we don't need to compute anything.
  const minRank = cels.map(c => c.rank).reduce((a, b) => b === 12 ? a : Math.min(a, b), 999)
  cels = cels.filter(c => c.rank <= minRank)

  if (!cels || !cels.length) throw new Error('date unavailable')

  return cels
}

function createOffsetDate(date, days) {
  date = new Date(date)
  date.setUTCDate(date.getUTCDate() + days)
  return date
}

function incrDate(date, inc) {
  date.setUTCDate(date.getUTCDate() + (inc ?? 1))
}

function isSameDate(d1, d2) {
  return d1.getTime() === d2.getTime()
}

function cacheRead(cache, date) {
  // cels is an Object in the cache, so we turn it into an Array
  return Object.values(
    cache?.
    ['y' + date.getUTCFullYear()]?.
    [date.getUTCMonth()]?.
    [date.getUTCDate() - 1] ?? {}
  )
}

function cacheWrite(cache, date, cels) {
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  const d = date.getUTCDate()
  const ykey = 'y' + y
  cache[ykey] ??= [] // months
  cache[ykey][m] ??= [] // dates
  cache[ykey][m][d - 1] ??= {} // celebrations
  if (!Array.isArray(cels)) cels = [cels]
  for (const cel of cels) cache[ykey][m][d - 1][cacheKey(cel)] = cel
}

function cacheKey(cel) {
  return cel.name.toLowerCase().replace(/[^a-zA-Z]/g, '')
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
    return new Date(Date.UTC(y.getFullYear(), y.getMonth(), y.getDate()))
  }
  return new Date(Date.UTC(y, m, d))
}

export { getCelebrations }
