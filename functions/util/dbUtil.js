const { Sequelize } = require('sequelize');
const mysql = require('../config/mysql-setting');

const db_name = mysql.setting.db_name.dev;
const db_user = mysql.setting.db_user;
const db_password = mysql.setting.db_password;

// connection setting
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
 * Define schema
 * The model will now be available in models under the name given to define
 * Ex: sequelize.models.match
 * Table name: match__league, match__spread, match__total, match__team__NBA, match__NBA
 */

 /*
 * 使用者資訊
 */
const User = sequelize.define(
  'user',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.INTEGER
    },
    avatar: {
      type: Sequelize.STRING
    },
    birthday: {
      type: Sequelize.INTEGER
    },
    birthday_tw: {
      type: Sequelize.DATE
    },
    display_name: {
      type: Sequelize.STRING
    },
    dividend: {
      type: Sequelize.INTEGER
    },
    email: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    point: {
      type: Sequelize.INTEGER
    },
    signature: {
      type: Sequelize.STRING
    },
    default_title: {
      type: Sequelize.STRING
    },
    // 改獨立成一個 titles table
    // titles: {
    //   type: Sequelize.STRING
    // },
    accuse_credit: {
      type: Sequelize.INTEGER,
    },
    block_count: {
      type: Sequelize.INTEGER
    },  
    block_message: {
      type: Sequelize.INTEGER
    },
    block_message_tw: {
      type: Sequelize.DATE
    },
    coin: {
      type: Sequelize.INTEGER
    },
    ingot: {
      type: Sequelize.INTEGER
    },
    rank1_count: {
      type: Sequelize.INTEGER
    },
    rank2_count: {
      type: Sequelize.INTEGER
    },
    rank3_count: {
      type: Sequelize.INTEGER
    },
    rank4_count: {
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

const Title = sequelize.define(
  'title',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    period: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    period_date: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    rank_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  },
  {
    indexes: [
      { fields: ['uid'] },
      { fields: ['period'] },
      { fields: ['period_date'] },
    ]
  }
);

const Rank = sequelize.define(
  'rank',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rank_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['rank_id']
      }
    ]
  }
);

/*
 * 各聯盟資訊，ex: NBA, MLB and so on
 */
sequelize.define(
  'match__league',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    league_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    radar_id: {
      type: Sequelize.STRING
    },
    sport: {
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    name_ch: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['league_id']
      }
    ]
  }
);

/*
 * 各讓分資訊，unique key 為賽事 ID + 盤口 ID
 */
const Spread = sequelize.define(
  'match__spread',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    spread_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    match_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING
    },
    handicap: {
      type: Sequelize.FLOAT
    },
    home_odd: {
      type: Sequelize.FLOAT
    },
    away_odd: {
      type: Sequelize.FLOAT
    },
    home_tw: {
      type: Sequelize.STRING
    },
    away_tw: {
      type: Sequelize.STRING
    },
    add_time: {
      type: Sequelize.DATE
    }
  },
  {
    // composite index
    indexes: [
      {
        unique: true,
        fields: ['spread_id', 'match_id']
      }
    ]
  }
);
/*
 * 各大小分資訊，unique key 為賽事 ID + 盤口 ID
 */
sequelize.define(
  'match__total',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    totals_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    match_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING
    },
    handicap: {
      type: Sequelize.FLOAT
    },
    over_odd: {
      type: Sequelize.FLOAT
    },
    under_odd: {
      type: Sequelize.FLOAT
    },
    over_tw: {
      type: Sequelize.STRING
    },
    add_time: {
      type: Sequelize.DATE
    }
  },
  {
    // composite index
    indexes: [
      {
        unique: true,
        fields: ['totals_id', 'match_id']
      }
    ]
  }
);
/*
 * NBA 各隊伍資訊，unique key 為 team_id
 */
sequelize.define(
  'match__team__NBA',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    team_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    radar_id: {
      type: Sequelize.STRING
    },
    name: {
      type: Sequelize.STRING
    },
    name_ch: {
      type: Sequelize.STRING
    },
    image_id: {
      type: Sequelize.STRING
    },
    alias: {
      type: Sequelize.STRING
    },
    alias_ch: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['team_id']
      }
    ]
  }
);

/*
 * NBA 各賽事資訊，unique key 為 bets_id
 */
const match_NBA = sequelize.define(
  'match__NBA',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bets_id: {
      type: Sequelize.STRING
    },
    radar_id: {
      type: Sequelize.STRING
    },
    home_id: {
      type: Sequelize.STRING
    },
    away_id: {
      type: Sequelize.STRING
    },
    spread_id: {
      type: Sequelize.STRING
    },
    totals_id: {
      type: Sequelize.STRING
    },
    sr_id: {
      type: Sequelize.STRING
    },
    scheduled: {
      type: Sequelize.INTEGER
    },
    scheduled_tw: { type: Sequelize.DATE },
    flag_prematch: {
      type: Sequelize.INTEGER
    },
    status: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['bets_id']
      }
    ]
  }
);

const dbUtil = {
  sequelize,
  Sequelize
};

module.exports = dbUtil;
