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
  // god_lists
  it('/rank/god_lists?league=NBA', async () => {
    const res = await request(url)
      .get('/rank/god_lists?league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('godlists');
  });

  it('/rank/god_lists?league=CCC 錯誤參數', async () => {
    const res = await request(url)
      .get('/rank/god_lists?league=CCC');

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });

  // win_bets_lists
  it('/rank/win_bets_lists?range=this_period&league=NBA 本期', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=this_season&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=this_week&league=NBA 這星期', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=this_week&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=last_week&league=NBA 上星期', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=last_week&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=this_month&league=NBA 這個月', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=this_month&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=last_month&league=NBA 上個月', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=last_month&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=this_season&league=NBA 本賽季', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=this_season&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_bets_lists?range=this_wEEEEEEEk&league=CCC 錯誤參數', async () => {
    const res = await request(url)
      .get('/rank/win_bets_lists?range=this_wEEEEEEEk&league=CCC');

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });

  // win_rate_lists
  it('/rank/win_rate_lists?range=this_season&league=NBA', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=this_season&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=this_week&league=NBA 這星期', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=this_week&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=last_week&league=NBA 上星期', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=last_week&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=this_month&league=NBA 這個月', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=this_month&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=last_month&league=NBA 上個月', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=last_month&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=this_season&league=NBA 本賽季', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=this_season&league=NBA');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('userlists');
  });

  it('/rank/win_rate_lists?range=this_wEEEEEEEk&league=CCC 錯誤參數', async () => {
    const res = await request(url)
      .get('/rank/win_rate_lists?range=this_wEEEEEEEk&league=CCC');

    expect(res.statusCode).toEqual(400);
    expect(res.body[0]).toHaveProperty('keyword');
  });
});
