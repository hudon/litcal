// TODO
// assume SF Archdiocese
// get all the celebrations
// - figure out the source of truth for liturgical calendars in my archdiocese.
  // - Can it be derived? or do I just wait for its yearly publication?
//console.log('cache');console.dir(cache, { depth: 10 })
// TODO sanctorale. some are movable (Mary Mother of the Church, Immaculate Heart)
//  most are fixed. Can make


/**
 * @typedef {Object} LitCelebration
 * @property {string} name
 * @property {string} cycle
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

  const incrDate = (d, i) => d.setUTCDate(d.getUTCDate() + (i ?? 1)) && d
  const createOffsetDate = (d, o) => incrDate(new Date(d), o)
  const isSameDay = (d1, d2) => d1.getTime() === d2.getTime()
  const createTemp = (n, r) => createLitCelebration(n, r, 'temporal')
  const createSanc = (n, r) => createLitCelebration(n, r, 'sanctoral')

  let cels = cacheRead(cache, date)

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
      const s = 'in Ordinary Time'
      for (let week = 1;cursor < ashWedDate; incrDate(cursor)) {
        if (cursor.getUTCDay() === 0) {
          week++
          cacheWrite(cache, cursor, createTemp(mkSundayName(week, s), 6))
        } else {
          cacheWrite(cache, cursor, createTemp(mkWeekdayName(cursor, week, s), 13))
        }
      }
      cursor = createOffsetDate(adventStartDate, -1)
      for (let week = 35;cursor > pentecostDate; incrDate(cursor, -1)) {
        if (cursor.getUTCDay() === 6) {
          week--
        } 
        if (cursor.getUTCDay() === 0) {
          let cel = createTemp(mkSundayName(week, s), 6)
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
            createTemp(mkWeekdayName(cursor, week, s), 13))
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
    } else if (goodFridayDate <= date && date < easterDate) { // Paschal Triduum
      const cursor = new Date(goodFridayDate)
      cacheWrite(cache, cursor, createTemp("Friday of the Lord's Passion", 1))
      incrDate(cursor)
      cacheWrite(cache, cursor, createTemp('Holy Saturday', 1))
    } else if (easterDate <= date && date <= pentecostDate) { // Easter
      const cursor = new Date(easterDate)
      cacheWrite(cache, cursor, createTemp('Easter Sunday', 1))
      for (incrDate(cursor); cursor.getUTCDay() !== 0; incrDate(cursor))
        cacheWrite(cache, cursor, createTemp(`${getDayName(cursor)} of the Octave of Easter`, 2))
      const season = 'of Easter'
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
      const season = 'of Advent'
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

  // If we compute the sanctoral feasts, compute all of them for the year, because they
  // sometimes jump from one season to the next if they collide.
  if (!cels.some(el => el.cycle === 'sanctoral')) {
    getFixedSanctorale().forEach(({ date: [m, d], name, rank }) => {
      const celDate = new Date(date)
      celDate.setUTCMonth(m)
      celDate.setUTCDate(d)
      cacheWrite(cache, celDate, createSanc(name, rank))
    })
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
    { date: [0, 4], name: 'Saint Elizabeth Ann Seton, Religious', rank: 10 },
    // TODO isn't he a Doctor now?
    { date: [0, 5], name: 'Saint John Neumann, Bishop', rank: 10 },
    { date: [0, 6], name: 'Saint André Bessette, Religious', rank: 12 },
    { date: [0, 7], name: 'Saint Raymond of Penyafort, Priest', rank: 12 },
    { date: [0, 13], name: 'Saint Hilary, Bishop and Doctor of the Church', rank: 12 },
    { date: [0, 17], name: 'Saint Anthony, Abbot', rank: 10 },
    { date: [0, 20], name: 'Saint Fabian, Pope and Martyr', rank: 12 },
    { date: [0, 20], name: 'Saint Sebastian, Martyr', rank: 12 },
    { date: [0, 21], name: 'Saint Agnes, Virgin and Martyr', rank: 10 },
    // TODO also add a rule to the "movable" section in Sanctorale logic
    { date: [0, 22], name: 'Day of Prayer for the Legal Protection of Unborn Children', rank: 12 },
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
    { date: [1, 8], name: 'Saint Jerome Emiliani', rank: 12 },
    { date: [1, 8], name: 'Saint Josephine Bakhita, Virgin', rank: 12 },
    { date: [1, 10], name: 'Saint Scholastica, Virgin', rank: 10 },
    { date: [1, 11], name: 'Our Lady of Lourdes', rank: 12 },
    { date: [1, 13], name: 'Saints Cyril, Monk, and Methodius, Bishop', rank: 10 },
    { date: [1, 17], name: 'The Seven Holy Founders of the Servite Order', rank: 12 },
    { date: [1, 21], name: 'Saint Peter Damian, Bishop and Doctor of the Church', rank: 12 },
    { date: [1, 22], name: 'The Chair of Saint Peter the Apostle', rank: 7 },
    { date: [1, 23], name: 'Saint Polycarp, Bishop and Martyr', rank: 10 },

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
    { date: [4, 20], name: 'Saint Bernadine of Siena, Priest', rank: 12 },
    { date: [4, 21], name: 'Saint Christopher Magallanes, Priest, and Companions, Martyrs', rank: 12 },
    { date: [4, 22], name: 'Saint Rita of Cascia, Religious', rank: 12 },
    { date: [4, 25], name: 'Saint Bede the Venerable, Priest and Doctor of the Church', rank: 12 },
    { date: [4, 25], name: 'Saint Gregory VII, Pope', rank: 12 },
    { date: [4, 25], name: "Saint Mary Magdalene de' Pazzi, Virgin", rank: 12 },
    { date: [4, 26], name: 'Saint Philip Neri, Priest', rank: 10 },
    { date: [4, 27], name: 'Saint Augustine of Canterbury, Bishop', rank: 12 },
    { date: [4, 29], name: 'Saint Paul VI, Pope', rank: 12 },
    { date: [4, 31], name: 'The Visitation of th eBlessed Virgin Mary', rank: 7 },

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

    { date: [6, 1], name: 'Saint Junipero Serra, Priest', rank: 12 },
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
    { date: [6, 18], name: 'Saint Camillus de Lellis, Priest', rank: 12 },
    { date: [6, 20], name: 'Saint Apollinaris, Bishop and Martyr', rank: 12 },
    { date: [6, 21], name: 'Saint Lawrence of Brindisi, Priest and Doctor of the Church', rank: 12 },
    { date: [6, 22], name: 'Saint mary Magdalene', rank: 7 },
    { date: [6, 23], name: 'Saint Bridget, Religious', rank: 12 },
    { date: [6, 24], name: 'Saint Sharbel Makhlūf, Priest', rank: 12 },
    { date: [6, 25], name: 'Saint James, Apostle', rank: 7 },
    { date: [6, 26], name: 'Saints Joachim and Anne, Parents of the Blessed Virgin Mary', rank: 10 },
    { date: [6, 29], name: 'Saint Martha', rank: 10 },
    { date: [6, 30], name: 'Saint Peter Chrysologus, Bishop and Doctor of the Church', rank: 12 },
    { date: [6, 31], name: 'Saint Ignatius of Loyola, Priest', rank: 10 },

    { date: [7, 1], name: 'Saint Alphonsus Mary Liguori, Bishop and Doctor of the Church', rank: 12 },
    { date: [7, 2], name: 'Saint Eusebius of Vercelli, Bishop', rank: 12 },
    { date: [7, 2], name: 'Saint Peter Julian Eymard, Priest', rank: 12 },
    { date: [7, 4], name: 'Saint John Mary Vianney', rank: 12 },
    { date: [7, 5], name: 'The Dedication of the Basilica of Saint Mary Major', rank: 12 },
    { date: [7, 6], name: 'The Transfiguration of the Lord', rank: 5 },
    { date: [7, 7], name: 'Saint Sixtus II, Pope, and Companions, Martyrs', rank: 12 },
    { date: [7, 7], name: 'Saint Cajetan, Priest', rank: 12 },
    { date: [7, 8], name: 'Saint Dominic, Priest', rank: 12 },
    { date: [7, 9], name: 'Saint Teresa Benedicta of the Cross, Virgin and Martyr', rank: 12 },
    { date: [7, 10], name: 'Saint Lawrence, Deacon and Martyr', rank: 7 },
    { date: [7, 11], name: 'Saint Clare, Virgin', rank: 10 },
    { date: [7, 12], name: 'Saint Jane Frances de Chantal, Religious', rank: 12 },
    { date: [7, 13], name: 'Saints Pontian, Pope, and Hippolytus, Priest, Martyrs', rank: 12 },
    { date: [7, 14], name: 'Saint Maximilian Mary Kolbe, Priest and Martyr', rank: 12 },
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
  ]
}

export { getCelebrations }
