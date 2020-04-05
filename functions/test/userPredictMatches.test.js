const modules = require('../util/modules');
const URL = 'localhost:5000';
const wrongSession = '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9';
const __session =
  '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjBwUjNXdyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoi5YmN56uv566h55CG5ZOhIiwicm9sZSI6MSwiYXVkIjoic3BvcnRzbG90dGVyeS10ZXN0IiwiYXV0aF90aW1lIjoxNTg2MDAxNTM0LCJ1c2VyX2lkIjoidmwycU1ZV0pUblRMYm1PNHJ0TjhyeGRvZENvMiIsInN1YiI6InZsMnFNWVdKVG5UTGJtTzRydE44cnhkb2RDbzIiLCJpYXQiOjE1ODYwMDE1MzcsImV4cCI6MTU4NjYwNjMzNywicGhvbmVfbnVtYmVyIjoiKzg4NjY2NjY2NjY2NiIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiKzg4NjY2NjY2NjY2NiJdfSwic2lnbl9pbl9wcm92aWRlciI6InBob25lIn19.ej8WE6HsyY72x52CMkVbwkvkrx_dA4Rcos8Z2kBl1sD_ICPRa_wf_Uya-wwPlRwtMiVN9FZ_2cks8aJJCRUQexDvSDkGrHS917T-DHDYlZRhNfPM0PfmMrKQTFej6ijzqiLhKJYnsglTN2CGomYYwwktM8vIYVa57wZnhjJ6JJ45xtD531ot97uqe1gYEbjjeMm53LvB5sFZGH261iCC8AweG2d2bCZD9y6VfM8Kbl9Xbmxi4kE3MvLHO2GRzJWnCxFwQWma_ZNnda0b0dkr7pxZClZJGimaGgzqOJMc3Hz_FRNgUQqEEJcKFt2V66CuqJ3h7ImPWFMr4TvpS3y3tA';

describe('POST /user/predict_matches', function () {
  test('1. Session is wrong, should show Unauthorized', async function () {
    const res = await modules
      .request(URL)
      .post('/user/predict_matches')
      .set('Cookie', wrongSession);
    expect(res.statusCode).toEqual(401);
  });

  test('2. Session is right, and normal user want to sell', async function (done) {
    const res = await modules
      .request(URL)
      .post('/user/predict_matches')
      .set('Cookie', __session)
      .send({
        league: 'NBA',
        sell: 1,
        matches: [{ id: '34893434', spread: ['37843', 'home', 2] }],
      });
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('devcode', 1201);
    done();
  });

  test('3. Session is right, and normal user want to predict one match in NBA', async function (done) {
    const matches = { id: '2114519', spread: ['31267231', 'home', 2] };
    const body = {
      league: 'NBA',
      sell: 0,
      matches: [matches],
    };
    const res = await modules
      .request(URL)
      .post('/user/predict_matches')
      .set('Cookie', __session)
      .send(body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', [matches]);
    done();
  });
});
