const { Sequelize } = require('sequelize');
const mysql = require('../config/mysql-setting');

// const db_name = mysql.setting.db_name.dev;
// const db_user = mysql.setting.db_user;
// const db_password = mysql.setting.db_password;

// connection setting
const sequelize = new Sequelize('dosport', 'root', 'dosportsSQL', {
  dialect: 'mysql',
  host: '35.188.137.1',
  // timestamps: true,
  // dialectOptions: mysql.setting.dialectOptions,
  // pool: mysql.setting.pool,
  // timezone: mysql.setting.timezone //for writing to database
});

/*
 * Define schema
 * The model will now be available in models under the name given to define
 * Ex: sequelize.models.match
 * Table name: match__league, match__spread, match__total, match__team__NBA, match__NBA
 */

/*
 * 各聯盟資訊，ex: NBA, MLB and so on
 */
// sequelize.sync(
//   {force:true}
// );
sequelize.define(
  'users__win__lists',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uid: {
      type: Sequelize.STRING
    },
    league_id:{
      type: Sequelize.INTEGER
    },
    rank: {
      type: Sequelize.INTEGER
    },
    avatar: {
      type: Sequelize.STRING,
      allowNull: true
    },
    displayname: {
      type: Sequelize.STRING
    },
    last_month_win_bets: {
      type: Sequelize.INTEGER
    },
    last_month_win_rate: {
      type: Sequelize.INTEGER
    },
    last_week_win_bets: {
      type: Sequelize.INTEGER
    },
    last_week_win_rate: {
      type: Sequelize.INTEGER
    },
    
    this_season_win_bets: {
      type: Sequelize.INTEGER
    },
    this_season_win_rate: {
      type: Sequelize.INTEGER
    },
    this_period_win_bets: {
      type: Sequelize.INTEGER
    },
    this_period_win_rate: {
      type: Sequelize.INTEGER
    },
    this_month_win_bets: {
      type: Sequelize.INTEGER
    },
    this_month_win_rate: {
      type: Sequelize.INTEGER
    },
    this_week_win_bets: {
      type: Sequelize.INTEGER
    },
    this_week_win_rate: {
      type: Sequelize.INTEGER
    },
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['uid']
      }
    ]
  }
);


const dbUtil = {
  sequelize,
  Sequelize
};

module.exports = dbUtil;
