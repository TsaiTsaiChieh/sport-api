// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:5000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie token 值
const token = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdUWDJldyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJhdWQiOiJzcG9ydHNsb3R0ZXJ5LXRlc3QiLCJhdXRoX3RpbWUiOjE1ODU1NDIzMDAsInVzZXJfaWQiOiIyV01SZ0h5VXd2VEx5SHBMb0FOazdnV0FEWm4xIiwic3ViIjoiMldNUmdIeVV3dlRMeUhwTG9BTms3Z1dBRFpuMSIsImlhdCI6MTU4NTU0MjMxNCwiZXhwIjoxNTg2MTQ3MTE0LCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7fSwic2lnbl9pbl9wcm92aWRlciI6ImN1c3RvbSJ9fQ.Z_FItdDe2X7oyX9hllx7RB0ERo-KwlnIpkADosSSdQQvBGMkNlttL3IphldDpOZmml65UUb66G8pwiaUpsa8Vg1en33l2LToKZPkdt-Z3NSbQFlU-G025jyJSg-zWq9NiV0j-1Hh59cXobhQRmqRfz4c5VpVKv3GyWYLY-gEV_oP5Ek6aJFIPMOFZBpX9Hw_YGKAE4p5xymHiFfkwcmlCsGH_C5QRWrC5MPgWU8StMXxaq9Z6cKq6uAwOqgJwk_GkawVHnBNdd-LBX-VtrCbeFuIa56uitWzlpiifVaEk9AB_UH82xTteocCXVsBd2f08xJNA2GoCsiOjlJvhu-MUA';
const __badtoken = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdUWDJldyJ9.eyJpc3Mi';

describe('/user Endpoints', () => {
  it('/user/predict_info 不正確登入session __badsession', async () => {
    const res = await request(url)
      .post('/user/predict_info')
      .set('Authorization', 'bearer ' + __badtoken);

    expect(res.statusCode).toEqual(401);
  });

  it('/user/predict_info', async () => {
    const res = await request(url)
      .post('/user/predict_info')
      .set('Authorization', 'bearer ' + token);;

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toEqual(typeof []);
  });

});