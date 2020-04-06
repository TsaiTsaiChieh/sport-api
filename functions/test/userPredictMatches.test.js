// const modules = require('../util/modules');
const URL = 'localhost:5000';
const request = require('supertest');
const API = '/user/predict_matches';
const wrongSession = '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9';
const normalUserSession =
  '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoi5YmN56uv566h55CG5ZOhIiwicm9sZSI6MSwiYXVkIjoic3BvcnRzbG90dGVyeS10ZXN0IiwiYXV0aF90aW1lIjoxNTg2MDAxNTM0LCJ1c2VyX2lkIjoidmwycU1ZV0pUblRMYm1PNHJ0TjhyeGRvZENvMiIsInN1YiI6InZsMnFNWVdKVG5UTGJtTzRydE44cnhkb2RDbzIiLCJpYXQiOjE1ODYwMDE1MzcsImV4cCI6MTU4NjYwNjMzNywicGhvbmVfbnVtYmVyIjoiKzg4NjY2NjY2NjY2NiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzg4NjY2NjY2NjY2NiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.ej8WE6HsyY72x52CMkVbwkvkrx_dA4Rcos8Z2kBl1sD_ICPRa_wf_Uya-wwPlRwtMiVN9FZ_2cks8aJJCRUQexDvSDkGrHS917T-DHDYlZRhNfPM0PfmMrKQTFej6ijzqiLhKJYnsglTN2CGomYYwwktM8vIYVa57wZnhjJ6JJ45xtD531ot97uqe1gYEbjjeMm53LvB5sFZGH261iCC8AweG2d2bCZD9y6VfM8Kbl9Xbmxi4kE3MvLHO2GRzJWnCxFwQWma_ZNnda0b0dkr7pxZClZJGimaGgzqOJMc3Hz_FRNgUQqEEJcKFt2V66CuqJ3h7ImPWFMr4TvpS3y3tA';
const godUserSession =
  '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoi44SY44SQIiwicm9sZSI6MiwidGl0bGVzIjoiQ0JBIiwiYXVkIjoic3BvcnRzbG90dGVyeS10ZXN0IiwiYXV0aF90aW1lIjoxNTg1NTcwMzQ0LCJ1c2VyX2lkIjoiWHc0ZE9LYTRtV2gzS3ZseDM1bVB0QU9YMlA1MiIsInN1YiI6Ilh3NGRPS2E0bVdoM0t2bHgzNW1QdEFPWDJQNTIiLCJpYXQiOjE1ODU1NzAzNTIsImV4cCI6MTU4NjE3NTE1MiwicGhvbmVfbnVtYmVyIjoiKzg4Njk5OTk5OTk5OSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzg4Njk5OTk5OTk5OSJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.NUsrCy1dABsMGMbt5BVaC-Gno7xs556He_loAropjgjhDdrl29SuF0hnw7FaDo9DkOSRkDuI14obQP0Jhv9ZgpNjRA-lZepAZBO2EcUp2UukMWL8t4zeP48LbgS22XvOfh9HtVDs3C9pvfjYBCJTEw6-oqOyXz_T9_OzgAXNV19cFgsfmjWaJII_ftljtlNOPgnY4TBqcZyVji7XnWGXL43EZW_nySka3UbFTquw_zy_dxSWvJeWGPpMGR6No9XEiONbcdpuVOXsvHRzdaWEcYk7FRjQ0HrBAd71c_e-MNCJmTf6B1BUHuLbMt2q63W66_CID_0_UQ1l8-F9uFpmTA';

describe('POST /user/predict_matches', function () {
  test('1. Session is wrong, should show Unauthorized', async function () {
    const res = await request(URL).post(API).set('Cookie', wrongSession);
    expect(res.statusCode).toEqual(401);
  });

  test('2. Session is right, and normal user want to sell', async function () {
    const res = await request(URL)
      .post(API)
      .set('Cookie', normalUserSession)
      .send({
        league: 'NBA',
        sell: 1,
        matches: [{ id: '34893434', spread: ['37843', 'home', 2] }],
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1201);
  });

  test('3. Session is right, and normal user want to predict one match in NBA', async function () {
    const matches = { id: '2114519', spread: ['31267231', 'home', 2] };
    const body = {
      league: 'NBA',
      sell: 0,
      matches: [matches],
    };
    const res = await request(URL)
      .post(API)
      .set('Cookie', normalUserSession)
      .send(body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', [matches]);
  });

  test('4. Session is right, and god user want to predict one match in NBA', async function () {
    const matches = { id: '2114519', spread: ['31267231', 'home', 2] };
    const body = {
      league: 'NBA',
      sell: 0,
      matches: [matches],
    };
    const res = await request(URL)
      .post(API)
      .set('Cookie', godUserSession)
      .send(body);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1202);
  });

  test('5. Session is right, and god user want to predict two matches which the handicaps are not opened in NBA', async function () {
    const matches = [
      {
        id: '2115973',
        spread: ['31267231', 'away', 2],
      },
      {
        id: '2118058',
        totals: ['31267231', 'away', 2],
      },
    ];
    const body = {
      league: 'NBA',
      sell: 0,
      matches,
    };
    const res = await request(URL)
      .post(API)
      .set('Cookie', godUserSession)
      .send(body);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1202);
  });
});
