const { Sequelize } = require('sequelize');
const mysql = require('../config/mysql-setting');

const db_name = mysql.setting.db_name;
const db_user = mysql.setting.db_user;
const db_password = mysql.setting.db_password;

const sequelize = new Sequelize(db_name, db_user, db_password, {
  dialect: mysql.setting.dialect,
  host: mysql.setting.host,
  timestamps: true,
  dialectOptions: mysql.setting.dialectOptions,
  pool: mysql.setting.pool,
  timezone: mysql.setting.timezone //for writing to database
});

/*
 * Define schema
 * The model will now be available in models under the name given to define
 * Ex: sequelize.models.match
 * Table name: match__league, match__spread, match__total, match__team__NBA, match__NBA
 */

/*
 * 文章資訊
 */
sequelize.define(
  'topic__article',
  {
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: { //球種/看板?
      type: Sequelize.STRING,
      allowNull: false
    },
    category: { //文章分類
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
    status: { //預設1為正常 其他可能-1為刪除之類的 待討論
      type: Sequelize.INTEGER,
      defaultValue: 1
    },
    view_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    }
  }
);

/*
 * 首頁圖
 */
sequelize.define(
  'home__banner',
  {
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
    }
  },
  {
    indexes: [
      {
        fields: ['sort', 'status']
      }
    ]
  }
);

const dbUtil = {
  sequelize,
  Sequelize
};

module.exports = dbUtil;
