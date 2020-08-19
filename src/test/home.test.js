// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:3000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie token 值
const token = '';

describe('/home Endpoints', () => {
  it('/home/god_lists', async () => {
    const res = await request(url)
      .get('/home/god_lists');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('godlists');
  });

  it('/home/hotTopics', async () => {
    const res = await request(url)
      .get('/home/hotTopics');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('topics');
  });

  // it('/home/livescore', async () => {
  //   const res = await request(url)
  //     .get('/home/livescore');

  //   expect(res.statusCode).toEqual(200);
  //   expect(typeof res.body).toEqual(typeof []);
  // });

  it('/home/win_rate_lists', async () => {
    const res = await request(url)
      .get('/home/win_rate_lists');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('win_rate_lists');
  });

  it('/home/win_bets_lists', async () => {
    const res = await request(url)
      .get('/home/win_bets_lists');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('win_bets_lists');
  });

  it('/home/bannerImage', async () => {
    const res = await request(url)
      .get('/home/bannerImage');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('banners');
  });
});
