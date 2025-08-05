//console.log('cache');console.dir(cache, { depth: 10 })


/**
 * @typedef {Object} LitCelebration
 * @property {string} name
 * @property {string} cycle
 * @property {rank} rank (1-13+
 */


/** creates a LitCelebration. */
function createLitCelebration(name, rank, cycle) {
  return { name, rank, cycle }
}

/**
  * Returns a list of celebrations for a given date. As seasons and dates are computed, they are stored in the cache
  * if it is provided. This makes subsequent requests faster.
  *
  * @param {Object} [cache] - the cache of celebrations (optional)
  * @param {Date} date - the date for which celebrations are sought. It should be at UTC midnight
  *                      of the date requested.
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
  let date = null
  if (arguments.length === 1) {
    date = cache
    cache = null
  } else if (arguments.length === 2) {
    date = _y
  } else if (arguments.length === 3) {
    date = new Date(utcDate(cache, _y, _m))
    cache = null
  } else {
    date = new Date(utcDate(_y, _m, _d))
  }
  cache ??= {}

  if (date.getTime() % 1000 * 60 * 60 * 24 !== 0) throw new Error('provided date must be set to midnight')

  const incrDate = (d, i) => d.setUTCDate(d.getUTCDate() + (i ?? 1)) && d
  const createOffsetDate = (d, o) => incrDate(new Date(d), o)

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

  const isSameDay = (d1, d2) => d1.getTime() === d2.getTime()
  const isLent = d => ashWedDate <= d && d < goodFridayDate
  const isOT = d => baptismDate < d && d < ashWedDate || pentecostDate < d && d < adventStartDate
  const createTemp = (n, r) => createLitCelebration(n, r, 'temporal')
  const createSanc = (n, r) => createLitCelebration(n, r, 'sanctoral')

  let cels = cacheRead(cache, date)

  // If we compute the temporal feasts, compute all for the season
  if (!cels.some(el => el.cycle === 'temporal')) {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday',
      'Friday', 'Saturday']
    const getDayName = d => dayNames[d.getUTCDay()]
    const ordinalSuffix = n => 
      10 < n && n < 20 ? 'th' : // w <=34, so it's safe to ignore 112th, 1311th, etc.
      n % 10 === 1 ? 'st' :
      n % 10 === 2 ? 'nd' :
      n % 10 === 3 ? 'rd' :
      'th'
    const mkSundayName = (w, s) => `${w}${ordinalSuffix(w)} Sunday of ${s}`
    const mkWeekdayName = (d, w, s) => `${getDayName(d)} of the ${w}${ordinalSuffix(w)} Week of ${s}`

    // we cacheWrite all celebrations in the Season the event is in
    if (date <= baptismDate) { // Christmas of this litYear
      const cursor = utcDate(date.getUTCFullYear(), 0, 1)
      cacheWrite(cache, cursor, createTemp('Mary, the Holy Mother of God', 3))
      incrDate(cursor)
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
      const season = 'Ordinary Time'
      for (let week = 1;cursor < ashWedDate; incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, season), 6))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, season), 13))
        }
      }
      cursor = createOffsetDate(adventStartDate, -1)
      for (let week = 35;cursor > pentecostDate; incrDate(cursor, -1)) {
        if (cursor.getUTCDay() === 6) {
          week--
        } 
        if (cursor.getUTCDay() === 0) {
          let cel = createTemp(mkSundayName(week, season), 6)
          if (week === 34) cel = createTemp('Our Lord Jesus Christ, King of the Universe', 3)
          if (isSameDay(pentecostDate, createOffsetDate(cursor, -7)))
            cel = createTemp('The Most Holy Trinity', 3)
          if (isSameDay(pentecostDate, createOffsetDate(cursor, -14)))
            cel = createTemp('The Most Holy Body and Blood of Christ', 3)
          cacheWrite(cache, cursor, cel)
        } else {
          cacheWrite(cache, cursor,
            isSameDay(pentecostDate, createOffsetDate(cursor, -19)) ?
            createTemp('The Most Sacred Heart of Jesus', 3) :
            createTemp(mkWeekdayName(cursor, week, season), 13))
        }
      }
    } else if (isLent(date)) { // Lent
      const cursor = new Date(ashWedDate)
      cacheWrite(cache, cursor, createTemp('Ash Wednesday', 2))
      incrDate(cursor)
      for (; cursor.getUTCDay() > 0; incrDate(cursor)) {
        const name = `${getDayName(cursor)} after Ash Wednesday`
        cacheWrite(cache, cursor, createTemp(name, 9))
      }
      let week = 0
      const season = 'Lent'
      for (;cursor < createOffsetDate(easterDate, -7); incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, season), 2))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, season), 9))
        }
      }
      cacheWrite(cache, cursor, createTemp("Palm Sunday of the Lord's Passion", 2))
      incrDate(cursor)
      for (; cursor.getUTCDay() < 4; incrDate(cursor))
        cacheWrite(cache, cursor, createTemp(`${getDayName(cursor)} of Holy Week`, 2))
      cacheWrite(cache, cursor, createTemp('Holy Thursday', 2))
    } else if (goodFridayDate <= date && date < easterDate) { // Paschal Triduum
      const cursor = new Date(goodFridayDate)
      cacheWrite(cache, cursor, createTemp("Friday of the Lord's Passion", 1))
      incrDate(cursor)
      cacheWrite(cache, cursor, createTemp('The Easter Vigil in the Holy Night', 1))
    } else if (easterDate <= date && date <= pentecostDate) { // Easter
      const cursor = new Date(easterDate)
      cacheWrite(cache, cursor, createTemp('Easter Sunday', 1))
      for (incrDate(cursor); cursor.getUTCDay() !== 0; incrDate(cursor))
        cacheWrite(cache, cursor, createTemp(`${getDayName(cursor)} of the Octave of Easter`, 2))
      const season = 'Easter'
      for (let week = 1; cursor < pentecostDate; incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          const name = week === 7 ? 'The Ascension of the Lord' : mkSundayName(week, season)
          cacheWrite(cache, cursor, createTemp(name, 2))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, season), 13))
        }
      }
      cacheWrite(cache, cursor, createTemp('Pentecost Sunday', 2))
    } else if (adventStartDate <= date && date < christmasDate) { // Advent of next litYear
      const cursor = new Date(adventStartDate)
      const season = 'Advent'
      for (let week = 0; cursor < christmasDate; incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, season), 2))
        } else {
          const rank = cursor.getUTCDate() >= 17 ? 9 : 13
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, season), rank))
        }
      }
    } else if (christmasDate <= date) { // Christmas of next litYear
      cacheWrite(cache, christmasDate, createTemp('The Nativity of the Lord', 2))
      let holyFamDate = createOffsetDate(christmasDate, 7 - christmasDate.getUTCDay())
      if (christmasDate.getUTCDay() === 0)
        holyFamDate = createOffsetDate(christmasDate, 5)
      cacheWrite(cache, holyFamDate,
        createTemp('The Holy Family of Jesus, Mary, and Joseph', 5))
      for (let i = 5; i < 8; i++) {
        const name = `${i}th Day within the Octave of Christmas`
        const octaveDate = createOffsetDate(christmasDate, i - 1)
        if (isSameDay(octaveDate, holyFamDate)) continue
        cacheWrite(cache, octaveDate, createTemp(name, 9))
      }
    }
  }

  const getHighestRank = cels =>
    cels
      .map(c => c.rank)
      .reduce((a, b) => b === 12 ? a : Math.min(a, b), 999)

  // TODO: if there are no sanctoral feasts on that date, that doesn't mean we don't have the Sanctoral calendar. Instead we should check if there are ANY sanctoral celebrations on ANY date
  // If we compute the sanctoral feasts, compute all of them for the year, because they
  // sometimes jump from one season to the next if they collide.
  if (!cels.some(el => el.cycle === 'sanctoral')) {
    let celDate = createOffsetDate(pentecostDate, 1)
    let cel = createSanc('The Blessed Virgin Mary, Mother of the Church', 10)
    cacheWrite(cache, celDate, cel)

    celDate = createOffsetDate(pentecostDate, 20)
    cel = createSanc('The Immaculate Heart of the Blessed Virgin Mary', 10)
    cacheWrite(cache, celDate, cel)

    celDate = utcDate(date.getUTCFullYear(), 10, 1)
    // Jump to the fourth Thursday (21 days plus the distance to first Thursday)
    if (celDate.getUTCDay() < 4) incrDate(celDate, 21 + 4 - celDate.getUTCDay()) 
    else if (celDate.getUTCDay() > 4) incrDate(celDate, 21 + 7 - celDate.getUTCDay() + 4)
    cel = createSanc('Thanksgiving Day', 12)
    cacheWrite(cache, celDate, cel)

    getFixedSanctorale().forEach(({ date: [m, d], name, rank }) => {
      const celDate = new Date(easterDate)
      celDate.setUTCMonth(m)
      celDate.setUTCDate(d)
      const cels = cacheRead(cache, celDate)
      const highRank = getHighestRank(cels.map(c => c.rank))
      if ((rank === 3 || rank === 4) && highRank <= rank) {
        // TODO move solemnities if they collide
        throw new Error('TODO: HANDLE ME')
      }

      // move to Monday if it falls on a Sunday
      if (name.includes('Unborn Children') && celDate.getUTCDay() === 0)
        incrDate(celDate)

      const isOblig = r => r === 10 || r === 11

      if (isOblig(rank) && isLent(celDate) && celDate.getUTCDay() !== 0)
        rank = 12

      const obligMems = cels.filter(c => isOblig(c.rank))
      if (isOblig(rank) &&
          // if there is only 1 mem, it might be the same mem as the one we are trying to add
          (obligMems.length > 1 || obligMems.length === 1 && obligMems[0].name !== name)) {
        rank = 12
        for (const mem of obligMems) mem.rank = 12
      }

      cacheWrite(cache, celDate, createSanc(name, rank))
    })

    const y = date.getUTCFullYear()
    for (let cursor = utcDate(y, 0, 1); cursor.getUTCFullYear() < y + 1; incrDate(cursor)) {
      if (cursor.getUTCDay() === 6 && isOT(cursor))
        cacheWrite(cache, cursor, createSanc('Saturday Memorial of the Blessed Virgin Mary', 12))
    }
  }

  cels = cacheRead(cache, date)

  // rank=12 is for "optional memorials", the rank only applies if the user decides wants it to.
  // There can be many optional memorials on a given date, and they only coexist when there is a rank=13 celebration
  const highestRank = getHighestRank(cels)
  cels = cels.filter(c => c.rank <= highestRank)

  if (!cels || !cels.length) throw new Error(`date ${date.toISOString()} is unavailable`);

  return cels
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
  return 'k' + cel.name.toLowerCase().replace(/[\W]/g, '')
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

function getFixedSanctorale() {
  return [
    { date: [0, 2], name: 'Saints Basil the Great and Gregory Nazianzen, Bishops and Doctors of the Church', rank: 10 },
    { date: [0, 3], name: 'The Most Holy Name of Jesus', rank: 12 },
    // TODO is it supposed to be 10 or 11?
    { date: [0, 4], name: 'Saint Elizabeth Ann Seton, Religious', rank: 11 },
    // TODO isn't he a Doctor now?
    { date: [0, 5], name: 'Saint John Neumann, Bishop', rank: 10 },
    { date: [0, 6], name: 'Saint André Bessette, Religious', rank: 12 },
    { date: [0, 7], name: 'Saint Raymond of Penyafort, Priest', rank: 12 },
    { date: [0, 13], name: 'Saint Hilary, Bishop and Doctor of the Church', rank: 12 },
    { date: [0, 17], name: 'Saint Anthony, Abbot', rank: 10 },
    { date: [0, 20], name: 'Saint Fabian, Pope and Martyr', rank: 12 },
    { date: [0, 20], name: 'Saint Sebastian, Martyr', rank: 12 },
    { date: [0, 21], name: 'Saint Agnes, Virgin and Martyr', rank: 10 },
    { date: [0, 22], name: 'Day of Prayer for the Legal Protection of Unborn Children', rank: 11 },
    { date: [0, 23], name: 'Saint Vincent, Deacon and Martyr', rank: 12 },
    { date: [0, 23], name: 'Saint Marianne Cope, Virgin', rank: 12 },
    { date: [0, 24], name: 'Saint Francis de Sales, Bishop and Doctor of the Church', rank: 10 },
    { date: [0, 25], name: 'The Conversion of Saint Paul the Apostle', rank: 7 },
    { date: [0, 26], name: 'Saints Timothy and Titus, Bishops', rank: 10 },
    { date: [0, 27], name: 'Saint Angela Merici, Virgin', rank: 12 },
    { date: [0, 28], name: 'Saint Thomas Aquinas, Priest and Doctor of the Church', rank: 10 },
    { date: [0, 31], name: 'Saint John Bosco, Priest', rank: 10 },

    { date: [1, 2], name: 'The Presentation of the Lord', rank: 5 },
    { date: [1, 3], name: 'Saint Blaise, Bishop and Martyr', rank: 12 },
    { date: [1, 3], name: 'Saint Ansgar, Bishop', rank: 12 },
    { date: [1, 5], name: 'Saint Agatha, Virgin and Martyr', rank: 10 },
    { date: [1, 6], name: 'Saint Paul Miki and Companions, Martyrs', rank: 10 },
    { date: [1, 8], name: 'Saint Jerome Emiliani, Priest', rank: 12 },
    { date: [1, 8], name: 'Saint Josephine Bakhita, Virgin', rank: 12 },
    { date: [1, 10], name: 'Saint Scholastica, Virgin', rank: 10 },
    { date: [1, 11], name: 'Our Lady of Lourdes', rank: 12 },
    { date: [1, 14], name: 'Saints Cyril, Monk, and Methodius, Bishop', rank: 10 },
    { date: [1, 17], name: 'The Seven Holy Founders of the Servite Order', rank: 12 },
    { date: [1, 21], name: 'Saint Peter Damian, Bishop and Doctor of the Church', rank: 12 },
    { date: [1, 22], name: 'The Chair of Saint Peter the Apostle', rank: 7 },
    { date: [1, 23], name: 'Saint Polycarp, Bishop and Martyr', rank: 10 },
    { date: [1, 27], name: 'Saint Gregory of Narek, Abbot and Doctor of the Church', rank: 12 },

    { date: [2, 3], name: 'Saint Katharine Drexel, Virgin', rank: 12 },
    { date: [2, 4], name: 'Saint Casimir', rank: 12 },
    { date: [2, 7], name: 'Saints Perpetua and Felicity, Martyrs', rank: 10 },
    { date: [2, 8], name: 'Saint John of God, Religious', rank: 10 },
    { date: [2, 9], name: 'Saint Frances of Rome, Religious', rank: 10 },
    { date: [2, 17], name: 'Saint Patrick, Bishop', rank: 10 },
    { date: [2, 18], name: 'Saint Cyril of Jerusalem, Bishop and Doctor of the Church', rank: 10 },
    { date: [2, 19], name: 'Saint Joseph, Spouse of the Blessed Virgin Mary', rank: 3 },
    { date: [2, 23], name: 'Saint Turibius of Mogrovejo, Bishop', rank: 10 },
    { date: [2, 25], name: 'The Annunciation of the Lord', rank: 3 },

    { date: [3, 2], name: 'Saint Francis of Paola, Hermit', rank: 12 },
    { date: [3, 4], name: 'Saint Isidore, Bishop and Doctor of the Church', rank: 12 },
    { date: [3, 5], name: 'Saint Vincent Ferrer, Priest', rank: 12 },
    { date: [3, 7], name: 'Saint John Baptist de la Salle, Priest', rank: 10 },
    { date: [3, 11], name: 'Saint Stanislaus, Bishop and Martyr', rank: 10 },
    { date: [3, 13], name: 'Saint Martin I, Pope and Martyr', rank: 12 },
    { date: [3, 21], name: 'Saint Anselm, Bishop and Doctor of the Church', rank: 12 },
    { date: [3, 23], name: 'Saint George, Martyr', rank: 12 },
    { date: [3, 23], name: 'Saint Adalbert, Bishop and Martyr', rank: 12 },
    { date: [3, 24], name: 'Saint Fidelis of Sigmaringen, Priest and Martyr', rank: 12 },
    { date: [3, 25], name: 'Saint Mark, Evangelist', rank: 7 },
    { date: [3, 28], name: 'Saint Peter Chanel, Priest and Martyr', rank: 12 },
    { date: [3, 28], name: 'Saint Louis Grignion de Montfort, Priest', rank: 12 },
    { date: [3, 29], name: 'Saint Catherine of Siena, Virgin and Doctor of the Church', rank: 10 },
    { date: [3, 30], name: 'Saint Pius V, Pope', rank: 12 },

    { date: [4, 1], name: 'Saint Joseph the Worker', rank: 12 },
    { date: [4, 2], name: 'Saint Athanasius, Bishop and Doctor of the Church', rank: 10 },
    { date: [4, 3], name: 'Saints Philip and James, Apostles', rank: 7 },
    { date: [4, 10], name: 'Saint Damien de Veuster, Priest', rank: 12 },
    { date: [4, 12], name: 'Saints Nereus and Achilleus, Martyrs', rank: 12 },
    { date: [4, 12], name: 'Saint Pancras, Martyr', rank: 12 },
    { date: [4, 13], name: 'Our Lady of Fatima', rank: 12 },
    { date: [4, 14], name: 'Saint Matthias, Apostle', rank: 7 },
    { date: [4, 15], name: 'Saint Isidore', rank: 12 },
    { date: [4, 18], name: 'Saint John I, Pope and Martyr', rank: 12 },
    { date: [4, 20], name: 'Saint Bernardine of Siena, Priest', rank: 12 },
    { date: [4, 21], name: 'Saint Christopher Magallanes, Priest, and Companions, Martyrs', rank: 12 },
    { date: [4, 22], name: 'Saint Rita of Cascia, Religious', rank: 12 },
    { date: [4, 25], name: 'Saint Bede the Venerable, Priest and Doctor of the Church', rank: 12 },
    { date: [4, 25], name: 'Saint Gregory VII, Pope', rank: 12 },
    { date: [4, 25], name: "Saint Mary Magdalene de' Pazzi, Virgin", rank: 12 },
    { date: [4, 26], name: 'Saint Philip Neri, Priest', rank: 10 },
    { date: [4, 27], name: 'Saint Augustine of Canterbury, Bishop', rank: 12 },
    { date: [4, 29], name: 'Saint Paul VI, Pope', rank: 12 },
    { date: [4, 31], name: 'The Visitation of the Blessed Virgin Mary', rank: 7 },

    { date: [5, 1], name: 'Saint Justin, Martyr', rank: 10 },
    { date: [5, 2], name: 'Saints Marcellinus and Peter, Martyrs', rank: 12 },
    { date: [5, 3], name: 'Saint Charles Lwanga and Companions, Martyrs', rank: 10 },
    { date: [5, 5], name: 'Saint Boniface, Bishop and Martyr', rank: 10 },
    { date: [5, 6], name: 'Saint Norbert, Bishop', rank: 12 },
    { date: [5, 9], name: 'Saint Ephrem, Deacon and Doctor of the Church', rank: 12 },
    { date: [5, 11], name: 'Saint Barnabas, Apostle', rank: 10 },
    { date: [5, 13], name: 'Saint Anthony of Padua, Priest and Doctor of the Church', rank: 10 },
    { date: [5, 19], name: 'Saint Romuald, Abbot', rank: 12 },
    { date: [5, 21], name: 'Saint Aloysius Gonzaga, Religious', rank: 10 },
    { date: [5, 22], name: 'Saint Paulinus of Nola, Bishop', rank: 12 },
    { date: [5, 22], name: 'Saints John Fisher, Bishop, and Thomas More, Martyrs', rank: 12 },
    { date: [5, 24], name: 'The Nativity of Saint John the Baptist', rank: 3 },
    { date: [5, 27], name: 'Saint Cyril of Alexandria, Bishop and Doctor of the Church', rank: 12 },
    { date: [5, 28], name: 'Saint Irenaeus, Bishop and Martyr', rank: 10 },
    { date: [5, 29], name: 'Saints Peter and Paul, Apostles', rank: 3 },
    { date: [5, 30], name: 'The First Martyrs of the Holy Roman Church', rank: 12 },

    { date: [6, 1], name: 'Saint Junípero Serra, Priest', rank: 12 },
    { date: [6, 3], name: 'Saint Thomas, Apostle', rank: 7 },
    { date: [6, 4], name: 'Independence Day', rank: 12 },
    { date: [6, 5], name: 'Saint Anthony Zaccaria, Priest', rank: 12 },
    { date: [6, 5], name: 'Saint Elizabeth of Portugal', rank: 12 },
    { date: [6, 6], name: 'Saint Maria Goretti, Virgin and Martyr', rank: 12 },
    { date: [6, 9], name: 'Saint Augustine Zhao Rong, Priest, and Companions, Martyrs', rank: 12 },
    { date: [6, 11], name: 'Saint Benedict, Abbot', rank: 10 },
    { date: [6, 13], name: 'Saint Henry', rank: 12 },
    { date: [6, 14], name: 'Saint Kateri Tekakwitha, Virgin', rank: 10 },
    { date: [6, 15], name: 'Saint Bonaventure, Bishop and Doctor of the Church', rank: 10 },
    { date: [6, 16], name: 'Our Lady of Mount Carmel', rank: 12 },
    // this one is on the 14 in the General Calendar
    { date: [6, 18], name: 'Saint Camillus de Lellis, Priest', rank: 12 },
    { date: [6, 20], name: 'Saint Apollinaris, Bishop and Martyr', rank: 12 },
    { date: [6, 21], name: 'Saint Lawrence of Brindisi, Priest and Doctor of the Church', rank: 12 },
    { date: [6, 22], name: 'Saint Mary Magdalene', rank: 10 },
    { date: [6, 23], name: 'Saint Bridget, Religious', rank: 12 },
    { date: [6, 24], name: 'Saint Sharbel Makhlūf, Priest', rank: 12 },
    { date: [6, 25], name: 'Saint James, Apostle', rank: 7 },
    { date: [6, 26], name: 'Saints Joachim and Anne, Parents of the Blessed Virgin Mary', rank: 10 },
    { date: [6, 29], name: 'Saint Martha', rank: 10 },
    { date: [6, 30], name: 'Saint Peter Chrysologus, Bishop and Doctor of the Church', rank: 12 },
    { date: [6, 31], name: 'Saint Ignatius of Loyola, Priest', rank: 10 },

    { date: [7, 1], name: 'Saint Alphonsus Mary Liguori, Bishop and Doctor of the Church', rank: 10 },
    { date: [7, 2], name: 'Saint Eusebius of Vercelli, Bishop', rank: 12 },
    { date: [7, 2], name: 'Saint Peter Julian Eymard, Priest', rank: 12 },
    { date: [7, 4], name: 'Saint John Mary Vianney, Priest', rank: 10 },
    { date: [7, 5], name: 'The Dedication of the Basilica of Saint Mary Major', rank: 12 },
    { date: [7, 6], name: 'The Transfiguration of the Lord', rank: 5 },
    { date: [7, 7], name: 'Saint Sixtus II, Pope, and Companions, Martyrs', rank: 12 },
    { date: [7, 7], name: 'Saint Cajetan, Priest', rank: 12 },
    { date: [7, 8], name: 'Saint Dominic, Priest', rank: 10 },
    { date: [7, 9], name: 'Saint Teresa Benedicta of the Cross, Virgin and Martyr', rank: 12 },
    { date: [7, 10], name: 'Saint Lawrence, Deacon and Martyr', rank: 7 },
    { date: [7, 11], name: 'Saint Clare, Virgin', rank: 10 },
    { date: [7, 12], name: 'Saint Jane Frances de Chantal, Religious', rank: 12 },
    { date: [7, 13], name: 'Saints Pontian, Pope, and Hippolytus, Priest, Martyrs', rank: 12 },
    { date: [7, 14], name: 'Saint Maximilian Mary Kolbe, Priest and Martyr', rank: 10 },
    { date: [7, 15], name: 'The Assumption of the Blessed Virgin Mary', rank: 3 },
    { date: [7, 16], name: 'Saint Stephen of Hungary', rank: 12 },
    { date: [7, 19], name: 'Saint John Eudes, Priest', rank: 12 },
    { date: [7, 20], name: 'Saint Bernard, Abbot and Doctor of the Church', rank: 10 },
    { date: [7, 21], name: 'Saint Pius X, Pope', rank: 10 },
    { date: [7, 22], name: 'The Queenship of the Blessed Virgin Mary', rank: 10 },
    { date: [7, 23], name: 'Saint Rose of Lima, Virgin', rank: 12 },
    { date: [7, 24], name: 'Saint Bartholomew, Apostle', rank: 7 },
    { date: [7, 25], name: 'Saint Louis', rank: 12 },
    { date: [7, 25], name: 'Saint Joseph Calasanz, Priest', rank: 12 },
    { date: [7, 27], name: 'Saint Monica', rank: 10 },
    { date: [7, 28], name: 'Saint Augustine, Bishop and Doctor of the Church', rank: 10 },
    { date: [7, 29], name: 'The Passion of Saint John the Baptist', rank: 10 },

    { date: [8, 3], name: 'Saint Gregory the Great, Pope and Doctor of the Church', rank: 10 },
    { date: [8, 8], name: 'The Nativity of the Blessed Virgin Mary', rank: 7 },
    { date: [8, 9], name: 'Saint Peter Claver, Priest', rank: 11 },
    { date: [8, 12], name: 'The Most Holy Name of Mary', rank: 12 },
    { date: [8, 13], name: 'Saint John Chrysostom, Bishop and Doctor of the Church', rank: 10 },
    // TODO right rank?
    { date: [8, 14], name: 'The Exaltation of the Holy Cross', rank: 5 },
    { date: [8, 15], name: 'Our Lady of Sorrows', rank: 10 },
    { date: [8, 16], name: 'Saints Cornelius, Pope, and Cyprian, Bishop, Martyrs', rank: 10 },
    { date: [8, 17], name: 'Saint Robert Bellarmine, Bishop and Doctor of the Church', rank: 12 },
    // Pope Francis added this optional memorial in 2021
    { date: [8, 17], name: 'Saint Hildegard of Bingen, Virgin and Doctor of the Church', rank: 12 },
    { date: [8, 19], name: 'Saint Januarius, Bishop and Martyr', rank: 12 },
    { date: [8, 20], name: 'Saints Andrew Kim Tae-gŏn, Priest, Paul Chŏng Ha-sang, and Companions, Martyrs', rank: 10 },
    { date: [8, 21], name: 'Saint Matthew, Apostle and Evangelist', rank: 7 },
    { date: [8, 23], name: 'Saint Pius of Pietrelcina, Priest', rank: 10 },
    { date: [8, 26], name: 'Saints Cosmas and Damian, Martyrs', rank: 12 },
    { date: [8, 27], name: 'Saint Vincent de Paul, Priest', rank: 10 },
    { date: [8, 28], name: 'Saint Wenceslaus, Martyr', rank: 12 },
    { date: [8, 28], name: 'Saint Lawrence Ruiz and Companions, Martyrs', rank: 12 },
    { date: [8, 29], name: 'Saints Michael, Gabriel, and Raphael, Archangels', rank: 7 },
    { date: [8, 30], name: 'Saint Jerome, Priest and Doctor of the Church', rank: 10 },

    { date: [9, 1], name: 'Saint Thérèse of the Child Jesus, Virgin and Doctor of the Church', rank: 10 },
    { date: [9, 2], name: 'The Holy Guardian Angels', rank: 10 },
    { date: [9, 4], name: 'Saint Francis of Assisi', rank: 10 },
    { date: [9, 5], name: 'Blessed Francis Xavier Seelos, Priest', rank: 12 },
    { date: [9, 6], name: 'Saint Bruno, Priest', rank: 12 },
    { date: [9, 6], name: 'Blessed Marie Rose Durocher, Virgin', rank: 12 },
    { date: [9, 7], name: 'Our Lady of the Rosary', rank: 10 },
    { date: [9, 9], name: 'Saint Denis, Bishop, and Companions, Martyrs', rank: 12 },
    { date: [9, 9], name: 'Saint John Leonardi, Priest', rank: 12 },
    { date: [9, 11], name: 'Saint John XXIII, Pope', rank: 12 },
    { date: [9, 14], name: 'Saint Callistus I, Pope and Martyr', rank: 12 },
    { date: [9, 15], name: 'Saint Teresa of Jesus, Virgin and Doctor of the Church', rank: 10 },
    { date: [9, 16], name: 'Saint Hedwig, Religious', rank: 12 },
    { date: [9, 16], name: 'Saint Margaret Mary Alacoque, Virgin', rank: 12 },
    { date: [9, 17], name: 'Saint Ignatius of Antioch, Bishop and Martyr', rank: 10 },
    { date: [9, 18], name: 'Saint Luke, Evangelist', rank: 7 },
    { date: [9, 19], name: 'Saints John de Brébeuf and Isaac Jogues, Priests, and Companions, Martyrs', rank: 10 },
    { date: [9, 20], name: 'Saint Paul of the Cross, Priest', rank: 12 },
    { date: [9, 22], name: 'Saint John Paul II, Pope', rank: 12 },
    { date: [9, 23], name: 'Saint John of Capestrano, Priest', rank: 12 },
    { date: [9, 24], name: 'Saint Anthony Mary Claret, Bishop', rank: 12 },
    { date: [9, 28], name: 'Saints Simon and Jude, Apostles', rank: 7 },

    { date: [10, 1], name: 'All Saints', rank: 3 },
    { date: [10, 2], name: 'The Commemoration of All the Faithful Departed', rank: 3 },
    { date: [10, 3], name: 'Saint Martin de Porres', rank: 12 },
    { date: [10, 4], name: 'Saint Charles Borromeo, Bishop', rank: 10 },
    { date: [10, 9], name: 'The Dedication of the Lateran Basilica', rank: 5 },
    { date: [10, 10], name: 'Saint Leo the Great, Pope and Doctor of the Church', rank: 10 },
    { date: [10, 11], name: 'Saint Martin of Tours, Bishop', rank: 10 },
    { date: [10, 12], name: 'Saint Josaphat, Bishop and Martyr', rank: 10 },
    { date: [10, 13], name: 'Saint Frances Xavier Cabrini, Virgin', rank: 11 },
    { date: [10, 15], name: 'Saint Albert the Great, Bishop and Doctor of the Church', rank: 12 },
    { date: [10, 16], name: 'Saint Margaret of Scotland', rank: 12 },
    { date: [10, 16], name: 'Saint Gertrude, Virgin', rank: 12 },
    { date: [10, 17], name: 'Saint Elizabeth of Hungary, Religious', rank: 10 },
    { date: [10, 18], name: 'The Dedication of the Basilicas of Saints Peter and Paul, Apostles', rank: 12 },
    { date: [10, 18], name: 'Saint Rose Philippine Duchesne, Virgin', rank: 12 },
    { date: [10, 21], name: 'The Presentation of the Blessed Virgin Mary', rank: 10 },
    { date: [10, 22], name: 'Saint Cecilia, Virgin and Martyr', rank: 10 },
    { date: [10, 23], name: 'Saint Clement I, Pope and Martyr', rank: 12 },
    { date: [10, 23], name: 'Saint Columban, Abbot', rank: 12 },
    { date: [10, 23], name: 'Blessed Miguel Agustín Pro, Priest and Martyr', rank: 12 },
    { date: [10, 24], name: 'Saint Andrew Dũng-Lạc, Priest, and Companions, Martyrs', rank: 10 },
    { date: [10, 25], name: 'Saint Catherine of Alexandria, Virgin and Martyr', rank: 12 },
    { date: [10, 30], name: 'Saint Andrew, Apostle', rank: 7 },

    { date: [11, 3], name: 'Saint Francis Xavier, Priest', rank: 10 },
    { date: [11, 4], name: 'Saint John Damascene, Priest and Doctor of the Church', rank: 12 },
    { date: [11, 6], name: 'Saint Nicholas, Bishop', rank: 12 },
    { date: [11, 7], name: 'Saint Ambrose, Bishop and Doctor of the Church', rank: 10 },
    { date: [11, 8], name: 'The Immaculate Conception of the Blessed Virgin Mary', rank: 4 },
    { date: [11, 9], name: 'Saint Juan Diego Cuauhtlatoatzin', rank: 12 },
    { date: [11, 10], name: 'Our Lady of Loreto', rank: 12 },
    { date: [11, 11], name: 'Saint Damasus I, Pope', rank: 12 },
    { date: [11, 12], name: 'Our Lady of Guadalupe', rank: 8 },
    { date: [11, 13], name: 'Saint Lucy, Virgin and Martyr', rank: 10 },
    { date: [11, 14], name: 'Saint John of the Cross, Priest and Doctor of the Church', rank: 10 },
    { date: [11, 21], name: 'Saint Peter Canisius, Priest and Doctor of the Church', rank: 12 },
    { date: [11, 23], name: 'Saint John of Kanty, Priest', rank: 12 },
    { date: [11, 26], name: 'Saint Stephen, the First Martyr', rank: 7 },
    { date: [11, 27], name: 'Saint John, Apostle and Evangelist', rank: 7 },
    { date: [11, 28], name: 'The Holy Innocent, Martyrs', rank: 7 },
    // St Thomas Becket memorial never gets the Mass bc it falls in the Octave, but the Mass can take the Collect prayer from it. For our purposes, it just will never get returned...
    // https://www.thomryng.com/amateurmonk/the-fifth-day-of-christmas-saint-thomas-becket-2023/#:~:text=Usually%20that,the%20day.
    { date: [11, 29], name: 'Saint Thomas Becket, Bishop and Martyr', rank: 12 },
    { date: [11, 31], name: 'Saint Sylvester I, Pope', rank: 12 },
  ]
}

export { getCelebrations, utcDate }
