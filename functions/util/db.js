const { Sequelize } = require('sequelize');
const mysql = require('../auth/mysql-setting');

const db_name = mysql.setting.db_name.dev;
const db_user = mysql.setting.db_user;
const db_password = mysql.setting.db_password;

// connection setting
const sequelize = new Sequelize(db_name, db_user, db_password, {
  dialect: mysql.setting.dialect,
  host: mysql.setting.host,
  timestamps: true,
  dialectOptions: {
    ssl: mysql.TC_SSL
  },
  pool: mysql.setting.pool,
  timezone: mysql.setting.timezone //for writing to database
});

/*
 * Define schema
 * The model will now be available in models under the name given to define
 * Ex: sequelize.models.match
 * Table name: match__league, match__spread, match__total, match__team__NBA, match__NBA
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

sequelize.define(
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

sequelize.define(
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

const db = {
  sequelize,
  Sequelize
};

module.exports = db;
