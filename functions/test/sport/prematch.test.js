const URL = 'localhost:5000';
const onlineURL = 'https://api-dosports.web.app';
const request = require('supertest');
const OLD_API = '/sport/prematch?league=NBA&date=2020-07-01';
const NEW_API = '/sport/matches?league=NBA&date=2020-07-01';

describe('GET /sport/prematch', function () {
  test('(1) Query matches when user not login with older API', async function () {
    const res = await request(URL).get(OLD_API);
    expect(res.statusCode).toEqual(200);
  });
  test('(2) Query matches when user not login with newest API', async function () {
    const res = await request(URL).get(NEW_API);
    expect(res.statusCode).toEqual(200);
  });
  test('(3) Query matches when user not login with older on-line API', async function () {
    const res = await request(onlineURL).get(OLD_API);
    expect(res.statusCode).toEqual(200);
  });
  test('(4) Query matches when user not login with newest on-line  API', async function () {
    const res = await request(onlineURL).get(NEW_API);
    expect(res.statusCode).toEqual(200);
  });
});
