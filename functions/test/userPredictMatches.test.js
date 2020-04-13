const URL = 'localhost:5000';
const request = require('supertest');
const API = '/user/predict_matches';
const wrongToken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9';
const normalUserToken =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoi5YmN56uv566h55CG5ZOhIiwicm9sZSI6MSwiYXVkIjoic3BvcnRzbG90dGVyeS10ZXN0IiwiYXV0aF90aW1lIjoxNTg2MDAxNTM0LCJ1c2VyX2lkIjoidmwycU1ZV0pUblRMYm1PNHJ0TjhyeGRvZENvMiIsInN1YiI6InZsMnFNWVdKVG5UTGJtTzRydE44cnhkb2RDbzIiLCJpYXQiOjE1ODYwMDE1MzcsImV4cCI6MTU4NjYwNjMzNywicGhvbmVfbnVtYmVyIjoiKzg4NjY2NjY2NjY2NiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzg4NjY2NjY2NjY2NiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.ej8WE6HsyY72x52CMkVbwkvkrx_dA4Rcos8Z2kBl1sD_ICPRa_wf_Uya-wwPlRwtMiVN9FZ_2cks8aJJCRUQexDvSDkGrHS917T-DHDYlZRhNfPM0PfmMrKQTFej6ijzqiLhKJYnsglTN2CGomYYwwktM8vIYVa57wZnhjJ6JJ45xtD531ot97uqe1gYEbjjeMm53LvB5sFZGH261iCC8AweG2d2bCZD9y6VfM8Kbl9Xbmxi4kE3MvLHO2GRzJWnCxFwQWma_ZNnda0b0dkr7pxZClZJGimaGgzqOJMc3Hz_FRNgUQqEEJcKFt2V66CuqJ3h7ImPWFMr4TvpS3y3tA';
const godUserToken =
  'eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoi44SY44SQIiwicm9sZSI6MiwidGl0bGVzIjpbIkNCQSIsIk5CQSIsIk1MQiIsIlNCTCJdLCJhdWQiOiJzcG9ydHNsb3R0ZXJ5LXRlc3QiLCJhdXRoX3RpbWUiOjE1ODY0MTE4ODUsInVzZXJfaWQiOiJYdzRkT0thNG1XaDNLdmx4MzVtUHRBT1gyUDUyIiwic3ViIjoiWHc0ZE9LYTRtV2gzS3ZseDM1bVB0QU9YMlA1MiIsImlhdCI6MTU4NjQxMTg4NywiZXhwIjoxNTg3MDE2Njg3LCJwaG9uZV9udW1iZXIiOiIrODg2OTk5OTk5OTk5IiwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJwaG9uZSI6WyIrODg2OTk5OTk5OTk5Il19LCJzaWduX2luX3Byb3ZpZGVyIjoicGhvbmUifX0.CBImav6PL-TpViIENov_v6vRFleTFmeU5O2uHr7n1Aiyti2DojMxseyzulnX9HrIm5Kpr5--KlLQCM7EvA0Db2A4fak8A84olEC1bMXh_vFDL7jiKqGwaM8PlB1z9fpOS5HoJQZ7qQ66yUF6stmeyN54UK9DvuUoRYNZp2tVfKpWoUvYwbzvo_uRsp-BnMOcVIf8zxaHDpE3bMNIoaRx4DKb6hiOzKqnlpA4BqZoRw4R10ByakSrZOW1ScCUlYOn6uA6ipit28VueptAtRBB6KLuWVp6KUUzf2zZBvHs9jtYMooNVNgVlfSYRGchHjldhRVpgITCjAK6k_jf0hHEBg';

// jest userPredictMatches.test.js --testTimeout=30000
describe('POST /user/predict_matches', function () {
  test('1. Session is wrong, should show Unauthorized', async function () {
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${wrongToken}`);
    expect(res.statusCode).toEqual(401);
  });

  test('2. Session is right, and normal user want to sell', async function () {
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${normalUserToken}`)
      .send({
        league: 'NBA',
        sell: 1,
        matches: [{ id: '34893434', spread: ['37843', 'home', 2] }]
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1201);
  });

  test('3. Session is right, and normal user want to predict one match in NBA', async function () {
    const matches = { id: '2114519', spread: ['31267231', 'home', 2] };
    const body = {
      league: 'NBA',
      sell: 0,
      matches: [matches]
    };
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${normalUserToken}`)
      .send(body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', [matches]);
  });

  test('4. Session is right, and god user want to predict one match in NBA', async function () {
    const matches = { id: '2114519', spread: ['31267231', 'home', 2] };
    const body = {
      league: 'NBA',
      sell: 0,
      matches: [matches]
    };
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${godUserToken}`)
      .send(body);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1202);
  });

  test('5. Session is right, and god user want to predict two matches which the handicaps are not opened in NBA', async function () {
    const matches = [
      {
        id: '2115973',
        spread: ['31267231', 'away', 2]
      },
      {
        id: '2118058',
        totals: ['31267231', 'over', 2]
      }
    ];
    const body = {
      league: 'NBA',
      sell: 0,
      matches
    };
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${godUserToken}`)
      .send(body);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1202);
  });

  test('6. Session is right, and god user want to predict many matches', async function () {
    const matches = [
      {
        id: '2119439',
        spread: ['31216615', 'away', 3]
      },
      {
        id: '2119439',
        totals: ['34334734', 'over', 3]
      },
      {
        id: '2000000',
        spread: ['spread_4', 'away', 3]
      },
      {
        id: '2000000',
        totals: ['totals_2', 'over', 3]
      },
      {
        id: '2114519',
        spread: ['31267231', 'home', 2]
      },
      {
        id: '2114519',
        totals: ['34409340', 'over', 2]
      },
      {
        id: '2115973',
        spread: ['31268919', 'home', 1]
      },
      {
        id: '2115973',
        totals: ['34417671', 'under', 3]
      },
      {
        id: '2117403',
        spread: ['31194971', 'home', 1]
      },
      {
        id: '2117403',
        totals: ['34333969', 'under', 3]
      }
    ];
    const body = {
      league: 'NBA',
      sell: 0,
      matches
    };
    const res = await request(URL)
      .post(API)
      .set('Authorization', `bearer ${godUserToken}`)
      .send(body);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1202);
  });
});
