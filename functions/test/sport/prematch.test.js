const setting = require('../../auth/jestTestSetting.json');
const request = require('supertest');
const OLD_API = '/sport/prematch?league=NBA&date=2020-07-01';
const NEW_API = '/sport/matches?league=NBA&date=2020-07-01';

describe('GET /sport/prematch', function () {
  test('--- [舊版]玩家看賽事資訊 API 測試開始 ---', function () {});
  test('(1) (本機) 使用者未登入', async function () {
    const res = await request(setting.localhost).get(OLD_API);
    expect(res.statusCode).toEqual(200);
  });
  test('(2) (本機) 大神使用者已登入', async function () {
    const res = await request(setting.localhost)
      .get(OLD_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`);
    expect(res.statusCode).toEqual(200);
  });
  test('(3) (上線) 使用者未登入', async function () {
    const res = await request(setting.online_URL).get(OLD_API);
    expect(res.statusCode).toEqual(200);
  });
  test('(4) (線上) 大神使用者已登入', async function () {
    const res = await request(setting.online_URL)
      .get(OLD_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`);
    expect(res.statusCode).toEqual(200);
  });
  test('--- [新版]玩家看賽事資訊 API 測試開始 ---', function () {});
  test('(1) (本機) 使用者未登入', async function () {
    const res = await request(setting.localhost).get(NEW_API);
    expect(res.statusCode).toEqual(200);
  });

  test('(2) (本機) 大神使用者已登入', async function () {
    const res = await request(setting.localhost)
      .get(NEW_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`);
    expect(res.statusCode).toEqual(200);
  });
  test('(3) (線上) 使用者未登入', async function () {
    const res = await request(setting.online_URL).get(NEW_API);
    expect(res.statusCode).toEqual(200);
  });

  test('(4) (線上) 大神使用者已登入', async function () {
    const res = await request(setting.online_URL)
      .get(NEW_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`);
    expect(res.statusCode).toEqual(200);
  });
});
