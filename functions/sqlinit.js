/* eslint-disable */
const modules = require('./util/modules');
const { Sequelize, Model, DataTypes } = require('sequelize');
const db_name = 'dosport';
const db_user = 'root';
const db_password = 'dosportsSQL';
const instance = 'sportslottery-test:us-central1:do-sports';
const fs = require('fs');

const sequelize = new Sequelize(`${db_name}`, `${db_user}`, `${db_password}`, {
  dialect: 'mysql',
  host: '35.188.137.1', //`/cloudsql/${instance}`,
  timestamps: true,
  dialectOptions: {
    //socketPath: `/cloudsql/${instance}`,
    ssl: {
      key: fs.readFileSync('/Users/ids93216/Documents/mysql/client-key.pem', 'utf-8'),
      cert: fs.readFileSync('/Users/ids93216/Documents/mysql/client-cert.pem', 'utf-8'),
      ca: fs.readFileSync('/Users/ids93216/Documents/mysql/server-ca.pem', 'utf-8')
    }
  },
  pool: {
    max: 50,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});
async function sqlinit(req, res) {
  // sequelize
  // .authenticate()
  // .then(() => {
  // })
  // .catch(err => {
  //   return res.status(500).json({msg: 'unable to connect to db', err: err.message})
  // });

  const dbDef = await sequelize.define('home__banner', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    link: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    },
    sort: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    status: {
      type: Sequelize.INTEGER,
      defaultValue: 1 //1為正常 -1可能為刪除 尚未實作
    },
  });

  // await dbDef.sync({ force: true }); //刪除重建資料表 慎用
  
  // await dbDef.bulkCreate([
  //   {
  //     name: '1585034799529.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585034799529.jpg?alt=media&token=74decada-ceab-47fb-a48d-fe599afff755',
  //     link: '',
  //     sort: null,
  //   },
  //   {
  //     name: '1585035836011.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585035836011.jpg?alt=media&token=bac7f9a9-8227-4f62-8a6d-1051e6f11cb6',
  //     link: 'http://localhost:5000/test/bannerImage.html',
  //     sort: null,
  //   },
  //   {
  //     name: '1585036039608.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585036039608.jpg?alt=media&token=649a9488-1b60-4c8b-b7bc-dc23760e2930',
  //     link: '',
  //     sort: null,
  //   },
  //   {
  //     name: '1585036268813.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585036268813.jpg?alt=media&token=feeac3db-3c9e-4e39-830f-852a094d9344',
  //     link: '',
  //     sort: null,
  //   },
  //   {
  //     name: '1585188139357.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585188139357.jpg?alt=media&token=3ea577f6-aea9-4ce1-8739-a4e06dfc3314',
  //     link: '',
  //     sort: 0,
  //   },
  //   {
  //     name: '1585188149451.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585188149451.jpg?alt=media&token=67dcb78a-5d38-4393-8d62-fbd1ece8aa71',
  //     link: '',
  //     sort: 1,
  //   },
  //   {
  //     name: '1585188159450.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1585188159450.jpg?alt=media&token=772e70e2-af52-4e5c-913a-5628da0c6968',
  //     link: '',
  //     sort: 2,
  //   },
  //   {
  //     name: '1586228787544.jpg',
  //     url: 'https://firebasestorage.googleapis.com/v0/b/sportslottery-test.appspot.com/o/home_banner%2F1586228787544.jpg?alt=media&token=f89b8b5d-42ba-4919-bd2f-d1f43fbb7a01',
  //     link: '',
  //     sort: null,
  //   },
  // ])
  // .then(() => {
  //   console.log('create data success!');
  // })
  // .catch(err => {
  //   return res.status(500).json({msg: 'create data failed', err: err.message})
  // });

  await dbDef.findAll().then(function(data) {
    res.json(data)
  })
}
module.exports = sqlinit;