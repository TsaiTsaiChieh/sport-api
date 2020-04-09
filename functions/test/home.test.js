// const modules = require('../../util/modules'); // 不可以用這個，會造成 jest 執行結束後，仍然無法正常結束
const moment = require('moment');
const request = require('supertest');

const localhost = 'localhost:5000';
const sportslottery_test = 'https://us-central1-sportslottery-test.cloudfunctions.net/api';
const apidosports = 'https://api-dosports.web.app';

const url = localhost // 依照需求自行切換測試網址

// 可以自行替換登入後 cookie session 值
const __session = '__session=eyJhbGciOiJSUzI1NiIsImtpZCI6IjdUWDJldyJ9.eyJpc3MiOiJodHRwczovL3Nlc3Npb24uZmlyZWJhc2UuZ29vZ2xlLmNvbS9zcG9ydHNsb3R0ZXJ5LXRlc3QiLCJuYW1lIjoibGVtb24iLCJwaWN0dXJlIjoiaHR0cHM6Ly9maXJlYmFzZXN0b3JhZ2UuZ29vZ2xlYXBpcy5jb20vdjAvYi9zcG9ydDE5eTA3MTUuYXBwc3BvdC5jb20vby9kZWZhdWx0JTJGYXZhdGFyJTJGZGVmYXVsdC1wcm9maWxlLWF2YXRhci5qcGc_YWx0XHUwMDNkbWVkaWFcdTAwMjZ0b2tlblx1MDAzZDc3NTMzODVmLTU0NTctNGZlMi1hZjhlLWFjZWY3NWZjY2NkOCIsInJvbGUiOjEsImF1ZCI6InNwb3J0c2xvdHRlcnktdGVzdCIsImF1dGhfdGltZSI6MTU4NTEyNjExNywidXNlcl9pZCI6IkRMUm5kNWlnUm1ha0MwVnJMeHo1UGg0NDNRajEiLCJzdWIiOiJETFJuZDVpZ1JtYWtDMFZyTHh6NVBoNDQzUWoxIiwiaWF0IjoxNTg1MTI5ODA5LCJleHAiOjE1ODU3MzQ2MDksImVtYWlsIjoia2VybzEzQGxpdmVtYWlsLnR3IiwiZW1haWxfdmVyaWZpZWQiOmZhbHNlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbImtlcm8xM0BsaXZlbWFpbC50dyJdfSwic2lnbl9pbl9wcm92aWRlciI6InBhc3N3b3JkIn19.DeGc5u2yhDsVF6cS-9eFtWr4a9N294Qe7wLtMkrofpweRfplFGOc0nfcwrDfWFS1NbFZwHP10ao0atZfj6HaaVh61VO0WiMOszNCvcRPr2LTAxpFr-MU1Un-0svsv7ONVIrM_uXDRN6vBw3amc5tPy4PUaxe8g2Pq6iDLcb5GIC45u7xO2vwir-TzTW09bW7FuTRZHDprauajc5AF_nLm6LvUSdEVhqnVGGxPggjkRd6gaDx6A4vvCwjhLZu_uVeAWcQ_eFieYfsvokPno1trdZPLCPTmQw-rWTbc4dPOxkS5gpvAPo8f8Xug7SlFAy_o2fT446MTnKP3YXARL9WTQ';

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

  it('/home/livescore', async () => {
    const res = await request(url)
      .get('/home/livescore');

    expect(res.statusCode).toEqual(200);
    expect(typeof res.body).toEqual(typeof []);
  });

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