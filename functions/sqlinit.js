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
  sequelize
  .authenticate()
  .then(() => {
  })
  .catch(err => {
    return res.status(500).json({msg: 'unable to connect to db', err: err.message})
  });

  const topicDef = sequelize.define('topic__article', {
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.STRING,
      allowNull: false
    },
    time: {
      type: Sequelize.DATE, 
      defaultValue: Sequelize.NOW,
    },
  });

  //await topicDef.sync({ force: true }); //刪除重建資料表 慎用
  
  topicDef.create({
    uid: '1234',
    type: '測試',
    category: '測試',
    title: '測試',
    content: '測試',
  })
  .then(() => {
    res.send('create article success!');
  })
  .catch(err => {
    return res.status(500).json({msg: 'create article failed', err: err.message})
  });

  topicDef.findAll().then(function(data) {
    res.json(data)
  })
}
module.exports = sqlinit;