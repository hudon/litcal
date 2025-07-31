import test from "node:test";
import assert from "node:assert";

import { getCelebrations } from './main.js';

test("getCelebrations", async (t) => {
  await test("returns an error if date is not available", (t) => {
    assert.throws(
      () => {
        getCelebrations(new Date(1999, 0, 1));
      },
      new Error("date unavailable")
    );
  });

  await test("returns Easter in 2025", (t) => {
    const res = getCelebrations(new Date(2025, 3, 20));

    assert.equal(res.length, 1);
    assert.equal(res[0].name, "Easter Sunday");
  });

  await test("returns Easter if you pass in y,m,d", (t) => {
    const res = getCelebrations(2025, 3, 20);

    assert.equal(res.length, 1);
    assert.equal(res[0].name, "Easter Sunday");
  });

  await test("returns Easter and populates cache", (t) => {
    const c = {};

    const res = getCelebrations(c, 2025, 3, 20);

    assert.equal(res[0].name, "Easter Sunday");
    assert.strictEqual(res[0], Object.values(c.y2025[3][19])[0]);
  });

  await test("returns cached Easter", (t) => {
    const c = {};
    getCelebrations(c, new Date(2025, 3, 20));

    const res = getCelebrations(c, new Date(2025, 3, 20));

    assert.equal(res[0].name, "Easter Sunday");
    assert.strictEqual(res[0], Object.values(c.y2025[3][19])[0]);
  });

  await test("returns Christmas 2024", (t) => {
    const res = getCelebrations(2025, 11, 25);

    assert.equal(res.length, 1);
    assert.equal(res[0].name, "Christmas Day");
  });

  await test("returns StJames for 20250725", (t) => {
    const res = getCelebrations(2025, 6, 25);

    assert.equal(res.length, 1);
    assert.equal(res[0].name, "Saint James, Apostle");
  });

  await test("demotes StJames feast for Sunday on 20210725", (t) => {
    const res = getCelebrations(2021, 6, 25);

    assert.equal(res.length, 1);
    assert.equal(res[0].name, "17th Sunday in Ordinary Time");
  });

  await test("gets Epiphany 2025", (t) => {
    const res = getCelebrations(2025, 0,  5);

    assert.equal(res[0].name, "The Epiphany of the Lord");
  });

  await test("gets Baptism 2025", (t) => {
    const res = getCelebrations(2025, 0,  12);

    assert.equal(res[0].name, "The Baptism of the Lord");
  });
});

