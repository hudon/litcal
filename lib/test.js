import { describe, it } from 'node:test'
import assert from 'node:assert'

import { getCelebrations } from './main.js'

describe('getCelebrations', () => {
  describe('in Christmas', () => {
    it('returns Christmas day 2025', () => {
      const res = getCelebrations(2025, 11, 25)
      assert.equal(res.length, 1)
      assert.equal(res[0].name, 'Christmas Day')
    })

    it('gets a Christmas weekday', () => {
      const res = getCelebrations(2025, 0, 3)
      assert.equal(res[0].name, 'Christmas Weekday')
    })

    it('gets Epiphany 2025', () => {
      const res = getCelebrations(2025, 0,  5)
      assert.equal(res[0].name, 'The Epiphany of the Lord')
    })

    it ('gets Epiphany on Jan 2', () => {
      const res = getCelebrations(2022, 0, 2)
      assert.equal(res[0].name, 'The Epiphany of the Lord')
    })

    it ('gets Epiphany on Jan 8', () => {
      const res = getCelebrations(2023, 0, 8)
      assert.equal(res[0].name, 'The Epiphany of the Lord')
    })

    it ('gets days after Epiphany', () => {
      const res = getCelebrations(2022, 0, 3)
      assert.equal(res[0].name, 'Monday after Epiphany Sunday')
    })

    it('gets Baptism 2025', () => {
      const res = getCelebrations(2025, 0,  12)
      assert.equal(res[0].name, 'The Baptism of the Lord')
    })

    it("gets Baptism when it's furthest out", () => {
      const res = getCelebrations(2019, 0, 13)
      assert.equal(res[0].name, 'The Baptism of the Lord')
    })

    it("gets Baptism when it's right after Epiphany", () => {
      const res = getCelebrations(2024, 0, 8)
      assert.equal(res[0].name, 'The Baptism of the Lord')
    })
  })

  describe('in Ordinary Time', () => {
    it('gets first day of OT', () => {
      const res = getCelebrations(2025, 0, 13)
      assert.equal(res[0].name, 'Monday of week 1 in Ordinary Time')
    })

    it('gets first Sunday of OT', () => {
      const res = getCelebrations(2025, 0, 19)
      assert.equal(res[0].name, '2nd Sunday in Ordinary Time')
    })

    it('gets OT day before Ash Wednesday', () => {
      const res = getCelebrations(2025, 2, 4)
      assert.equal(res[0].name, 'Tuesday of week 8 in Ordinary Time')
    })

    it('gets first day of OT2', () => {
      const res = getCelebrations(2025, 5, 9)
      assert.equal(res[0].name, 'Monday of week 10 in Ordinary Time')
    })

    it('gets OT in the second part of OT', () => {
      const res = getCelebrations(2021, 6, 25)
      assert.equal(res.length, 1)
      assert.equal(res[0].name, '17th Sunday in Ordinary Time')
    })

    it('gets OT Sunday with right suffix', () => {
      const res = getCelebrations(2025, 7, 31)
      assert.equal(res[0].name, '22nd Sunday in Ordinary Time')
    })

    it('gets last day of OT2', () => {
      const res = getCelebrations(2025, 10, 29)
      assert.equal(res[0].name, 'Saturday of week 34 in Ordinary Time')
    })
  })

  describe('in Lent', () => {
    it('gets a weekday after Ash Wednesday', () => {
      const res = getCelebrations(2025, 2, 7)
      assert.equal(res[0].name, 'Friday after Ash Wednesday')
    })

    it('gets the Saturday after Ash Wednesday', () => {
      const res = getCelebrations(2025, 2, 8)
      assert.equal(res[0].name, 'Saturday after Ash Wednesday')
    })

    it('gets a weekday', () => {
      const res = getCelebrations(2025, 2, 15)
      assert.equal(res[0].name, 'Saturday of week 1 of Lent')
    })

    it('gets a Sunday', () => {
      const res = getCelebrations(2025, 2, 9)
      assert.equal(res[0].name, '1st Sunday of Lent')
    })

    it('gets Palm Sunday', () => {
      const res = getCelebrations(2023, 3, 2)
      assert.equal(res[0].name, "Palm Sunday of the Lord's Passion")
    })

    it('gets Holy Tuesday', () => {
      const res = getCelebrations(2023, 3, 4)
      assert.equal(res[0].name, "Tuesday of Holy Week")
    })

    it('gets Holy Thursday', () => {
      const res = getCelebrations(2023, 3, 6)
      assert.equal(res[0].name, 'Holy Thursday')
    })
  })

  describe('in Paschal Triduum', () => {
  })

  describe('in Easter', () => {
  })

  it('returns an error if date is not available', () => {
    assert.throws(
      () => {
        getCelebrations(new Date(1999, 3, 2))
      },
      new Error('date unavailable')
    )
  })

  it('returns Easter in 2025', () => {
    const res = getCelebrations(new Date(2025, 3, 20))
    assert.equal(res.length, 1)
    assert.equal(res[0].name, 'Easter Sunday')
  })

  it('returns Easter if you pass in y,m,d', () => {
    const res = getCelebrations(2025, 3, 20)
    assert.equal(res.length, 1)
    assert.equal(res[0].name, 'Easter Sunday')
  })

  it('returns Easter and populates cache', () => {
    const c = {}

    const res = getCelebrations(c, 2025, 3, 20)

    assert.equal(res[0].name, 'Easter Sunday')
    assert.strictEqual(res[0], Object.values(c.y2025[3][19])[0])
  })

  it('returns cached Easter', () => {
    const c = {}
    getCelebrations(c, new Date(2025, 3, 20))

    const res = getCelebrations(c, new Date(2025, 3, 20))

    assert.equal(res[0].name, 'Easter Sunday')
    assert.strictEqual(res[0], Object.values(c.y2025[3][19])[0])
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

