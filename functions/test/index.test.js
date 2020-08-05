// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:5000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie token 值
const token = '';

describe('/emo Endpoints', () => {
  it('/messages/list', async () => {
    const res = await request(url)
      .get('/messages/list');

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toEqual(true);
  });
});
