import fs from 'fs'
import { describe, it } from 'node:test'
import assert from 'node:assert'

import { utcDate, getCelebrations } from './main.js'

function assertGetsCelebrations(expectations) {
  for (const [params, name] of expectations) {
    const res = getCelebrations(...params)
    assert.equal(res[0].name, name)
  }
}

describe('getCelebrations', () => {
  it('gets temporal celebrations in Advent', () => {
    assertGetsCelebrations([
      [[2025, 10, 30], '1st Sunday of Advent'],
      [[2025, 11, 5], 'Friday of week 1 of Advent'],
      // Gaudete Sunday
      [[2025, 11, 14], '3rd Sunday of Advent']
    ])
  })

  it('gets temporal celebrations in Christmas', () => {
    console.log('christmas time')
    assertGetsCelebrations([
      [[2025, 11, 25], 'The Nativity of the Lord'],
      // Holy Family on Sunday
      [[2023, 11, 31], 'The Holy Family of Jesus, Mary, and Joseph'],
      // Holy Family moved to 30th
      [[2022, 11, 30], 'The Holy Family of Jesus, Mary, and Joseph'],
      [[2027, 11, 30], '6th Day within the Octave of Christmas'],
      [[2025, 0, 3], 'Christmas Weekday'],
      [[2025, 0, 1], 'Mary, the Holy Mother of God'],
      // Epiphany on various days
      [[2025, 0,  5], 'The Epiphany of the Lord'],
      [[2022, 0, 2], 'The Epiphany of the Lord'],
      [[2023, 0, 8], 'The Epiphany of the Lord'],
      [[2022, 0, 3], 'Monday after Epiphany Sunday'],
      // Baptism on various days
      [[2025, 0,  12], 'The Baptism of the Lord'],
      [[2019, 0, 13], 'The Baptism of the Lord'],
      [[2024, 0, 8], 'The Baptism of the Lord']
    ])
  })

  it('gets temporal celebrations in Ordinary Time', () => {
    assertGetsCelebrations([
      [[2025, 0, 13], 'Monday of week 1 in Ordinary Time'],
      // First Sunday of OT1
      [[2025, 0, 19], '2nd Sunday in Ordinary Time'],
      [[2025, 2, 4], 'Tuesday of week 8 in Ordinary Time'],
      // First day of OT2
      [[2025, 5, 10], 'Tuesday of week 10 in Ordinary Time'],
      [[2025, 5, 15], 'The Most Holy Trinity'],
      [[2025, 5, 22], 'The Most Holy Body and Blood of Christ'],
      [[2025, 5, 27], 'The Most Sacred Heart of Jesus'],
      [[2025, 10, 23], 'Our Lord Jesus Christ, King of the Universe'],
      [[2021, 6, 25], '17th Sunday in Ordinary Time'],
      [[2025, 7, 31], '22nd Sunday in Ordinary Time'],
      [[2025, 10, 29], 'Saturday of week 34 in Ordinary Time']
    ])
  })

  it('gets temporal celebrations in Lent', () => {
    assertGetsCelebrations([
      [[2025, 2, 7], 'Friday after Ash Wednesday'],
      [[2025, 2, 8], 'Saturday after Ash Wednesday'],
      [[2025, 2, 15], 'Saturday of week 1 of Lent'],
      [[2025, 2, 9], '1st Sunday of Lent'],
      // Laetare
      [[2025, 2, 30], '4th Sunday of Lent'],
      [[2023, 3, 2], "Palm Sunday of the Lord's Passion"],
      [[2023, 3, 4], 'Tuesday of Holy Week'],
      [[2023, 3, 6], 'Holy Thursday']
    ])
  })

  it('gets temporal celebrations in Paschal Triduum', () => {
    assertGetsCelebrations([
      [[2023, 3, 7], "Friday of the Lord's Passion"],
      [[2023, 3, 8], 'Holy Saturday']
    ])
  })

  it('gets temporal celebrations in Easter', () => {
    const expects = [
      [[2025, 3, 23], 'Wednesday of the Octave of Easter'],
      // Divine Mercy
      [[2025, 3, 27], '2nd Sunday of Easter'],
      // What is Ascension in some dioceses
      [[2025, 4, 29], 'Thursday of week 6 of Easter'],
      [[2025, 4, 18], '5th Sunday of Easter'],
      [[2025, 5, 1], 'The Ascension of the Lord'],
      [[2025, 5, 8], 'Pentecost Sunday']
    ]
    assertGetsCelebrations(expects)
  })

  let filename = 'test-data-2025.json'
  const data2025 = JSON.parse(fs.readFileSync(filename, 'utf8'))

  it('gets all days of 2020 correctly', () => {
  })

  it('gets all days of 2021 correctly', () => {
  })

  it('gets all days of 2022 correctly', () => {
  })

  it('gets all days of 2023 correctly', () => {
  })

  it('gets all days of 2024 correctly', () => {
  })

  it('gets all days of 2025 correctly', () => {
    const cache = {}
    for (let [key, val] of Object.entries(data2025)) {
      const date = new Date(key)
      const res = getCelebrations(cache, date)
      assert.equal(res[0].name, val[0].name)
      assert.equal(res[0].rank, val[0].rank)
    }
  })

  it('accepts a Date argument', () => {
    const res = getCelebrations(utcDate(2025, 3, 20))
    assert.equal(res.length, 1)
    assert.equal(res[0].name, 'Easter Sunday')
  })

  it('accepts a y,m,d argument', () => {
    const res = getCelebrations(2025, 3, 20)
    assert.equal(res.length, 1)
    assert.equal(res[0].name, 'Easter Sunday')
  })

  it('populates cache', () => {
    const c = {}
    const res = getCelebrations(c, 2025, 3, 20)
    assert.equal(res[0].name, 'Easter Sunday')
    assert.strictEqual(res[0], Object.values(c.y2025[3][19])[0])
  })

  it('returns cached Easter', () => {
    const c = {}
    const res1 = getCelebrations(c, utcDate(2025, 3, 20))
    const res2 = getCelebrations(c, utcDate(2025, 3, 20))
    assert.strictEqual(res2[0], res1[0])
    assert.strictEqual(res2[0], Object.values(c.y2025[3][19])[0])
  })

  it('returns StJames for 20250725', () => {
    const res = getCelebrations(2025, 6, 25)
    assert.equal(res[0].name, 'Saint James, Apostle')
  })

  it('demotes StJames feast for Sunday on 20210725', () => {
    const res = getCelebrations(2021, 6, 25)
    assert.equal(res.length, 1)
    assert.equal(res[0].name, '17th Sunday in Ordinary Time')
  })
})

