const setting = require('../../auth/jestTestSetting.json');
const request = require('supertest');
const OLD_API = '/user/predict_matches';
const NEW_API = '/user/predictions';

describe('POST /user/predictions', function () {
  const oneMatchPrediction = {
    league: 'NBA',
    sell: 0,
    matches: [
      { id: '2118810', spread: ['31235573', 'home', 3] },
      { id: '2118810', totals: ['34458529', 'under', 1] }
    ]
  };
  test('--- [舊版]使用者送出預測 ---', function () {});
  test('(1) (本機) 一般使用者更新預測單', async function () {
    const res = await request(setting.localhost)
      .post(OLD_API)
      .set('Authorization', `bearer ${setting.frontendNormalUserToken_7}`)
      .send(oneMatchPrediction);
    expect(res.statusCode).toEqual(200);
  });
  test('(2) (本機) 大神使用者更新預測單', async function () {
    const res = await request(setting.localhost)
      .post(OLD_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`)
      .send(oneMatchPrediction);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('devcode', 1000);
  });
  test('(3) (線上) 一般使用者更新預測單', async function () {
    const res = await request(setting.online_URL)
      .post(OLD_API)
      .set('Authorization', `bearer ${setting.frontendNormalUserToken_7}`)
      .send(oneMatchPrediction);

    expect(res.statusCode).toEqual(200);
  });
  test('(4) (線上) 大神使用者更新預測單', async function () {
    const res = await request(setting.online_URL)
      .post(OLD_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`)
      .send(oneMatchPrediction);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('devcode', 1000);
  });
  test('--- [新版]使用者送出預測 ---', function () {});
  const normalPrediction = Object.assign({}, oneMatchPrediction);
  normalPrediction.sell = -1;
  const godPrediction = Object.assign({}, oneMatchPrediction);
  godPrediction.sell = 1;

  test('(1) (本機) 一般使用者更新預測單', async function () {
    const res = await request(setting.localhost)
      .post(NEW_API)
      .set('Authorization', `bearer ${setting.frontendNormalUserToken_7}`)
      .send(normalPrediction);

    expect(res.statusCode).toEqual(200);
  });
  test('(2) (本機) 大神使用者更新預測單', async function () {
    const res = await request(setting.localhost)
      .post(NEW_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`)
      .send(godPrediction);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('devcode', 1000);
  });
  test('(3) (線上) 一般使用者更新預測單', async function () {
    const res = await request(setting.online_URL)
      .post(NEW_API)
      .set('Authorization', `bearer ${setting.frontendNormalUserToken_7}`)
      .send(normalPrediction);

    expect(res.statusCode).toEqual(200);
  });
  test('(4) (線上) 大神使用者更新預測單', async function () {
    const res = await request(setting.online_URL)
      .post(NEW_API)
      .set('Authorization', `bearer ${setting.godUserToken_9}`)
      .send(godPrediction);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('devcode', 1000);
  });
});
