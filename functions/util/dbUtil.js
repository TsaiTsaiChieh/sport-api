const { Sequelize } = require('sequelize');
const Op = Sequelize.Op;
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
  logging: false, // disable logging; default: console.log
  timezone: mysql.setting.timezone // for writing to database
});

/*
 * Define schema
 * The model will now be available in models under the name given to define
 * Ex: sequelize.models.match
 * Match ref: match, match__league, match__team, match__spread, match__total
 * User ref: user__prediction, user__prediction__description
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
      type: Sequelize.INTEGER
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
    }
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

/*
 * 歷史大神 含 大神戰績資訊
 */
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
    },
    default_title: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    win_bets: {
      // 勝注
      type: Sequelize.INTEGER
    },
    win_rate: {
      // 勝率
      type: Sequelize.INTEGER
    },
    continue: {
      // 連贏 N 天
      type: Sequelize.INTEGER
    },
    predict_rate1: {
      // 近N日 N過 N  // 近N日過 N
      type: Sequelize.INTEGER
    },
    predict_rate2: {
      type: Sequelize.INTEGER
    },
    predict_rate3: {
      type: Sequelize.INTEGER
    },
    win_bets_continue: {
      // 勝注連過 Ｎ日
      type: Sequelize.INTEGER
    },
    matches_rate1: {
      // 近 Ｎ 場過 Ｎ 場
      type: Sequelize.INTEGER
    },
    matches_rate2: {
      type: Sequelize.INTEGER
    },
    matches_continue: {
      // 連贏Ｎ場
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      { fields: ['uid'] },
      { fields: ['period'] },
      { fields: ['period_date'] },
      { fields: ['league_id'] }
    ]
  }
);

const Rank = sequelize.define(
  'user__rank',
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
    },
    price: {
      type: Sequelize.INTEGER
    },
    sub_price: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['rank_id']
      }
    ]
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
const League = sequelize.define(
  'match__league',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    league_id: {
      type: Sequelize.STRING(8),
      allowNull: false
    },
    radar_id: {
      type: Sequelize.STRING
    },
    sport_id: {
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    ori_name: {
      type: Sequelize.STRING
    },
    name_ch: {
      type: Sequelize.STRING
    },
    ori_league_id: {
      type: Sequelize.STRING
    },
    ori_sport_id: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['ori_league_id']
      },
      {
        fields: ['league_id']
      },
      {
        fields: ['name']
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
      type: Sequelize.STRING(8)
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
const Totals = sequelize.define(
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
      type: Sequelize.STRING(8)
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
 * 各隊伍資訊，unique key 為 team_id
 */
const Team = sequelize.define(
  'match__team',
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
    league_id: {
      type: Sequelize.STRING(8)
    },
    sport_id: {
      type: Sequelize.STRING
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
    },
    injury: {
      type: Sequelize.TEXT
    },
    information: {
      type: Sequelize.TEXT
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
 * 各賽事資訊，unique key 為 bets_id
 */
const Match = sequelize.define(
  'match',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bets_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING(8)
    },
    sport_id: {
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
    scheduled_tw: {
      type: Sequelize.DATE
    },
    flag_prematch: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    status: {
      type: Sequelize.INTEGER
    },
    home_points: {
      type: Sequelize.INTEGER
    },
    away_points: {
      type: Sequelize.INTEGER
    },
    spread_result: {
      type: Sequelize.STRING
    },
    totals_result: {
      type: Sequelize.STRING
    },
    ori_league_id: {
      type: Sequelize.STRING
    },
    ori_sport_id: {
      type: Sequelize.STRING
    },
    home_player: {
      type: Sequelize.TEXT
    },
    away_player: {
      type: Sequelize.TEXT
    },
    home_team: {
      type: Sequelize.TEXT
    },
    away_team: {
      type: Sequelize.TEXT
    },
    home_injury: {
      type: Sequelize.TEXT
    },
    away_injury: {
      type: Sequelize.TEXT
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['bets_id']
      },
      { fields: ['scheduled', 'flag_prematch', 'status'] },
      {
        fields: ['status', 'spread_id']
      },
      {
        fields: ['status', 'totals_id']
      }
    ]
  }
);

const Season = sequelize.define(
  'match__season',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    radar_id: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    league_id: {
      type: Sequelize.STRING(8)
    },
    league_name: {
      type: Sequelize.STRING
    },
    season: {
      type: Sequelize.INTEGER
    },
    start_date: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    end_date: {
      type: Sequelize.STRING,
      defaultValue: null
    },
    status: {
      type: Sequelize.INTEGER
    },
    type: {
      type: Sequelize.STRING
    },
    current: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['league_id', 'season', 'type']
      },
      {
        fields: ['league_id', 'current']
      }
    ]
  }
);

/*
 * 預測單的資訊，unique key 為 bets_id, uid
 */
const Prediction = sequelize.define(
  'user__prediction',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    bets_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING(8)
    },
    sell: {
      type: Sequelize.INTEGER
    },
    match_scheduled: {
      type: Sequelize.INTEGER
    },
    spread_id: {
      type: Sequelize.STRING
    },
    spread_option: {
      type: Sequelize.STRING
    },
    spread_bets: {
      type: Sequelize.INTEGER
    },
    spread_result: {
      type: Sequelize.STRING
    },
    totals_id: {
      type: Sequelize.STRING
    },
    totals_option: {
      type: Sequelize.STRING
    },
    totals_bets: {
      type: Sequelize.INTEGER
    },
    totals_result: {
      type: Sequelize.STRING
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    user_status: {
      type: Sequelize.STRING
    },
    spread_result_flag: {
      type: Sequelize.FLOAT,
      defaultValue: -2
    },
    totals_result_flag: {
      type: Sequelize.FLOAT,
      defaultValue: -2
    }
  },
  {
    indexes: [
      {
        fields: ['uid', 'bets_id', 'spread_id']
      },
      {
        fields: ['uid', 'bets_id', 'totals_id']
      },
      {
        fields: ['uid', 'match_scheduled']
      },
      {
        unique: true,
        fields: ['uid', 'bets_id'] // 若無這組 key，使用者分別新增讓分或大小分會是兩張預測單
      },
      {
        fields: ['sell', 'league_id']
      },
      {
        fields: ['bets_id']
      },
      {
        fields: ['spread_id', 'totals_id'] // 為了刪除注單功能：清空 spread_id 和 totals_id 同時為空的無效注單
      }
    ]
  }
);

/*
 * 大神販售預測單的資訊，unique key 為 uid, day, league_id
 */
const PredictionDescription = sequelize.define(
  'user__prediction__description',
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
    rank_id: {
      type: Sequelize.STRING
    },
    league_id: {
      type: Sequelize.STRING(8)
    },
    day: {
      type: Sequelize.INTEGER
    },
    description: {
      type: Sequelize.TEXT
    },
    tips: {
      type: Sequelize.TEXT
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['uid', 'day', 'league_id']
      }
    ]
  }
);

/*
 * 各聯盟賽事結算資訊
 */
const Users_WinLists = sequelize.define(
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
    league_id: {
      type: Sequelize.INTEGER
    },
    last_season_win_bets: {
      type: Sequelize.FLOAT
    },
    last_season_win_rate: {
      type: Sequelize.FLOAT
    },
    last_period_win_bets: {
      type: Sequelize.FLOAT
    },
    last_period_win_rate: {
      type: Sequelize.FLOAT
    },
    last_month_win_bets: {
      type: Sequelize.FLOAT
    },
    last_month_win_rate: {
      type: Sequelize.FLOAT
    },
    last_week_win_bets: {
      type: Sequelize.FLOAT
    },
    last_week_win_rate: {
      type: Sequelize.FLOAT
    },
    this_season_win_bets: {
      type: Sequelize.FLOAT
    },
    this_season_win_rate: {
      type: Sequelize.FLOAT
    },
    this_period_win_bets: {
      type: Sequelize.FLOAT
    },
    this_period_win_rate: {
      type: Sequelize.FLOAT
    },
    this_month_win_bets: {
      type: Sequelize.FLOAT
    },
    this_month_win_rate: {
      type: Sequelize.FLOAT
    },
    this_week_win_bets: {
      type: Sequelize.FLOAT
    },
    this_week_win_rate: {
      type: Sequelize.FLOAT
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['uid', 'league_id']
      }
    ]
  }
);

/*
 * 各聯盟賽事結算資訊歷史記錄表
 */
const Users_WinListsHistory = sequelize.define(
  'users__win__lists__history',
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    uid: {
      type: Sequelize.STRING
    },
    league_id: {
      type: Sequelize.INTEGER
    },
    win_bets: {
      type: Sequelize.FLOAT
    },
    win_rate: {
      type: Sequelize.FLOAT
    },
    matches_count: {
      type: Sequelize.INTEGER
    },
    correct_counts: {
      type: Sequelize.INTEGER
    },
    fault_counts: {
      type: Sequelize.INTEGER
    },
    date_timestamp: {
      type: Sequelize.INTEGER
    },
    day_of_year: {
      type: Sequelize.INTEGER
    },
    period: {
      type: Sequelize.INTEGER
    },
    week: {
      type: Sequelize.INTEGER
    },
    month: {
      type: Sequelize.INTEGER
    },
    season: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        name: 'uldwms',
        fields: [
          'uid',
          'league_id',
          'date_timestamp',
          'date',
          'period',
          'week',
          'month',
          'season'
        ],
        unique: true
      }
      // { fields: ['uid', 'league_id', 'week'] },
      // { fields: ['uid', 'league_id', 'month'] },
      // { fields: ['uid', 'league_id', 'season'] }
    ]
  }
);

const UserFollow = sequelize.define(
  'user__follow',
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
    follow_uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING(8),
      allowNull: false
    }
  },
  {
    indexes: [
      {
        fields: ['uid']
      }
    ]
  }
);

/* 這邊給如果用 */

/*
 * 最愛大神
 */
const User_FavoriteGod = sequelize.define(
  'user__favoritegod',
  {
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    god_uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    indexes: [
      {
        fields: ['uid']
      }
    ]
  }
);

/*
 * 文章
 */
const Topic_Article = sequelize.define(
  'topic__article',
  {
    article_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    type: {
      // 球種/看板?
      type: Sequelize.STRING,
      allowNull: false
    },
    category: {
      // 文章分類
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    view_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    like_count: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    status: {
      // 預設1為正常 其他可能-1為刪除之類的 待討論
      type: Sequelize.INTEGER,
      defaultValue: 1,
      allowNull: false
    },
    delete_reason: {
      type: Sequelize.TEXT
    }
  },
  {
    indexes: [
      {
        fields: ['article_id', 'uid', 'type', 'category']
      }
    ]
  }
);

/*
 * 文章留言
 */
const Topic_Reply = sequelize.define(
  'topic__reply',
  {
    reply_id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    article_id: {
      // 文章id
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    },
    replyto_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    replyto_floor: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    images: {
      // 放圖片url用
      type: Sequelize.TEXT,
      allowNull: true
    },
    status: {
      // 預設1為正常 其他可能-1為刪除之類的 待討論
      type: Sequelize.INTEGER,
      defaultValue: 1
    }
  },
  {
    indexes: [
      {
        fields: ['article_id']
      }
    ]
  }
);

/*
 * 文章讚
 */
const Topic_Like = sequelize.define(
  'topic__like',
  {
    article_id: {
      // 文章id
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    indexes: [
      {
        fields: ['article_id', 'uid']
      }
    ]
  }
);

/*
 * 留言讚
 */
const Topic_ReplyLike = sequelize.define(
  'topic__replylike',
  {
    reply_id: {
      // 文章id
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    indexes: [
      {
        fields: ['reply_id', 'uid']
      }
    ]
  }
);

/*
 * 收藏文章
 */
const Topic_FavoriteArticle = sequelize.define(
  'topic__favoritearticle',
  {
    article_id: {
      // 文章id
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uid: {
      type: Sequelize.STRING,
      allowNull: false
    }
  },
  {
    indexes: [
      {
        fields: ['article_id', 'uid']
      }
    ]
  }
);

/*
 * 檢舉文章
 */
const Service_ReportTopics = sequelize.define('service__reporttopic', {
  uid: {
    type: Sequelize.STRING,
    allowNull: true
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  article_id: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  reply: {
    type: Sequelize.STRING
  }
});

/*
 * 聯絡客服
 */
const Service_Contact = sequelize.define('service__contact', {
  uid: {
    type: Sequelize.STRING,
    allowNull: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  content: {
    type: Sequelize.STRING,
    allowNull: false
  },
  images: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

/*
 * 首頁圖
 */
const Home_Banner = sequelize.define(
  'home__banner', // 不要再動了 拜託
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
      defaultValue: 1 // 1為正常 -1可能為刪除 尚未實作
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

const Buy = sequelize.define(
  'user__buy',
  {
    buy_id: {
      type: Sequelize.INTEGER,
      primaryKey: true
    },
    uid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    god_id: {
      type: Sequelize.STRING
    },
    god_rank: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    scheduled: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        fields: ['buy_id', 'uid', 'league_id']
      }
    ]
  }
);

const Honor_board = sequelize.define(
  'user__honor__board',
  {
    honor_id: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    uid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    league_id: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: ''
    },
    rank_id: {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: ''
    },
    scheduled: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        fields: ['honor_id', 'uid', 'rank_id']
      }
    ]
  }
);

const News = sequelize.define(
  'user__new',
  {
    news_id: {
      type: Sequelize.INTEGER
    },
    uid: {
      type: Sequelize.STRING
    },
    title: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.STRING
    },
    status: {
      type: Sequelize.INTEGER
    },
    scheduled: {
      type: Sequelize.INTEGER
    }
  },
  {
    indexes: [
      {
        fields: ['honor_id', 'uid', 'rank_id']
      }
    ]
  }
);

const Bank = sequelize.define(
  'user__bank',
  {
    bank_id: {
      type: Sequelize.INTEGER
    },
    uid: {
      type: Sequelize.STRING
    },
    bank_code: {
      type: Sequelize.STRING
    },
    bank_username: {
      type: Sequelize.STRING
    },
    bank_account: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['bank_id', 'uid']
      }
    ]
  }
);

/* 轉換紀錄狀態碼 */
const Transfer_Status = sequelize.define(
  'user__transfer__status',
  {
    status_code: {
      type: Sequelize.INTEGER
    },
    status_content: {
      type: Sequelize.STRING
    }
  },
  {
    indexes: [
      {
        unique: true,
        fields: ['status_code']
      }
    ]
  }
);

const dbUtil = {
  sequelize,
  Sequelize,
  Op,
  League,
  Spread,
  Totals,
  Match,
  Team,
  Prediction,
  PredictionDescription,
  User,
  Title,
  Rank,
  Users_WinLists,
  Users_WinListsHistory,
  User_FavoriteGod,
  Topic_Like,
  Topic_ReplyLike,
  Topic_Reply,
  Topic_Article,
  Topic_FavoriteArticle,
  Home_Banner,
  Service_Contact,
  Buy,
  Honor_board,
  News,
  Bank,
  Transfer_Status,
  Season,
  UserFollow
};

module.exports = dbUtil;
