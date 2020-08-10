// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:5000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie token 值
let token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdUWDJldyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJhdWQiOiJzcG9ydHNsb3R0ZXJ5LXRlc3QiLCJhdXRoX3RpbWUiOjE1ODU1NDIzMDAsInVzZXJfaWQiOiIyV01SZ0h5VXd2VEx5SHBMb0FOazdnV0FEWm4xIiwic3ViIjoiMldNUmdIeVV3dlRMeUhwTG9BTms3Z1dBRFpuMSIsImlhdCI6MTU4NTU0MjMxNCwiZXhwIjoxNTg2MTQ3MTE0LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImN1c3RvbSJ9fQ.Z_FItdDe2X7oyX9hllx7RB0ERo-KwlnIpkADosSSdQQvBGMkNlttL3IphldDpOZmml65UUb66G8pwiaUpsa8Vg1en33l2LToKZPkdt-Z3NSbQFlU-G025jyJSg-zWq9NiV0j-1Hh59cXobhQRmqRfz4c5VpVKv3GyWYLY-gEV_oP5Ek6aJFIPMOFZBpX9Hw_YGKAE4p5xymHiFfkwcmlCsGH_C5QRWrC5MPgWU8StMXxaq9Z6cKq6uAwOqgJwk_GkawVHnBNdd-LBX-VtrCbeFuIa56uitWzlpiifVaEk9AB_UH82xTteocCXVsBd2f08xJNA2GoCsiOjlJvhu-MUA';
const __badtoken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdUWDJldyJ9.eyJpc3Mi';

// 從 /auth/uid2token 取得 uid token 再跟 auth/login 取得系統 token
const uid = '2WMRgHyUwvTLyHpLoANk7gWADZn1';

beforeAll(async () => {
  const res = await request(url).post('/auth/uid2token').send({
    uid: uid
  });

  const res2 = await request(url).post('/auth/login').send({
    token: res.body.user.stsTokenManager.accessToken
  });

  // 登入系統取得 系統定義 token，會蓋掉上面的設定
  res2.body.token === undefined ? '照上面設定的token' : token = res2.body.token;
});

// 開始測試
describe('/user Endpoints', () => {
  it('post /user/predict_info 不正確登入session __badsession', async () => {
    const res = await request(url)
      .post('/user/predict_info')
      .set('Authorization', 'bearer ' + __badtoken);

    expect(res.statusCode).toEqual(401);
  });

  it('post /user/predict_info', async () => {
    const res = await request(url)
      .post('/user/predict_info')
      .set('Authorization', 'bearer ' + token); ;

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toEqual(typeof []);
  });

  // god_league_rank 預設聯盟
  // 顯示 預設聯盟 + 所有聯盟預設稱號 ( 稱號 (鑽金銀銅 Rank) + 預設成就(近幾過幾) )
  it('get /user/god_league_rank_default_league', async () => {
    const res = await request(url)
      .get('/user/god_league_rank_default_league')
      .set('Authorization', 'bearer ' + token); ;

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('default_league_rank');
    expect(res.body).toHaveProperty('lists');
  });

  // 變更 預設顯示聯盟稱號（稱號 (鑽金銀銅 Rank) + 成就(近幾過幾)）
  it('post /user/god_league_rank_set_default_league 錯誤 league', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_set_default_league')
      .set('Authorization', 'bearer ' + token)
      .send({
        "league": "NBA1"
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });

  it('post /user/god_league_rank_set_default_league', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_set_default_league')
      .set('Authorization', 'bearer ' + token)
      .send({
        "league": "NBA"
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  // god_league_rank 所有聯盟稱號 + 預設所有顯示成就
  // 顯示 所有聯盟 稱號 搭配之 所有成就
  it('get /user/god_league_rank_all_title', async () => {
    const res = await request(url)
      .get('/user/god_league_rank_all_title')
      .set('Authorization', 'bearer ' + token); ;

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('default_league_rank');
    expect(res.body).toHaveProperty('lists');
  });

  // 變更 稱號 搭配之 成就
  it('post /user/god_league_rank_set_all_league_title 錯誤 league', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_set_all_league_title')
      .set('Authorization', 'bearer ' + token)
      .send({
        "titles": [
          {"league": "NBA1", "default_title": 2},
          {"league": "MLB", "default_title": 4}
        ]
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });

  it('post /user/god_league_rank_set_all_league_title', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_set_all_league_title')
      .set('Authorization', 'bearer ' + token)
      .send({
        "titles": [
          {"league": "NBA", "default_title": 2},
          {"league": "MLB", "default_title": 4}
        ]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success');
  });

  // 查詢大神稱號
  it('get /user/god_league_rank', async () => {
    const res = await request(url)
      .get('/user/god_league_rank')
      .set('Authorization', 'bearer ' + token); ;

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toEqual(typeof []);
  });

  it('post /user/god_league_rank_receive 錯誤 league', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_receive')
      .set('Authorization', 'bearer ' + token)
      .send({
        "leagues": ["NBA1", "MLB"]
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });

  it('post /user/god_league_rank_receive', async () => {
    const res = await request(url)
      .post('/user/god_league_rank_receive')
      .set('Authorization', 'bearer ' + token)
      .send({
        "leagues": ["NBA", "MLB"]
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', ["NBA", "MLB"]);
  });

});
