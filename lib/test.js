import test from "node:test";
import assert from "node:assert";

import { getCelebrations } from './main.js';

test("getCelebrations returns an error if date is not available", (t) => {
  assert.throws(
    () => {
      console.log('yippee')
      getCelebrations(new Date(1999, 0, 1));
      console.log('yippoo')
    },
    new Error("date unavailable")
  );
});

test("getCelebrations returns Easter in 2025", (t) => {
  const res = getCelebrations(new Date(2025, 3, 20));

  assert.equal(res.length, 1);
  assert.equal(res[0].name, "Easter");
});

test("getCelebrations returns Easter if you pass in y,m,d", (t) => {
  const res = getCelebrations(2025, 3, 20);

  assert.equal(res.length, 1);
  assert.equal(res[0].name, "Easter");
});

test("getCelebrations returns Easter and populates cache", (t) => {
  const c = {};

  const res = getCelebrations(c, 2025, 3, 20);

  assert.equal(res[0].name, "Easter");
  assert.strictEqual(res[0], c.y2025[3][19][0]);
});

test("getCelebrations returns cached Easter", (t) => {
  const april = [];
  april[19] = [{ name: "Easter" }];
  const year = [];
  year[3] = april;
  const c = { "y2025": year };

  const res = getCelebrations(c, new Date(2025, 3, 20));

  assert.equal(res[0].name, "Easter");
  assert.strictEqual(c.y2025[3][19], res);
});

test("getCelebrations returns Christmas 2024", (t) => {
  const res = getCelebrations(2025, 11, 25);

  assert.equal(res.length, 1);
  assert.equal(res[0].name, "Christmas");
});
