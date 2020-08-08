const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const env_values = require('./src/config/env_values');
const compression = require('compression');

const app = express();
app.use(compression());
app.disable('x-powered-by');
app.use(cookieParser());
app.use(helmet());
app.use(helmet.xssFilter());
app.use(helmet.frameguard());
app.use(
  bodyParser.json({
    limit: '50mb',
    extended: true
  })
);
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true
  })
);
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, private'
  );
  next();
});

const localOrigin = 'http://172.16.21';

const corsOptions = {
  origin: function(origin, callback) {
    if (env_values.corsList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else if (origin.includes(localOrigin)) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

app.use(morgan('tiny'));

app.use(express.json());
// app.use('/sqlinit', require('./sqlinit'));
app.use('/auth', require('./src/routers/authentication'));
app.use('/user', require('./src/routers/user'));
app.use('/messages', require('./src/routers/messages'));
app.use('/sport', require('./src/routers/sport'));
// app.use('/messages_temp', require('./Deprecated/messages'));
// for test pubsub endpoint
app.use('/home', require('./src/routers/home'));
app.use('/topics', require('./src/routers/topics'));
app.use('/general', require('./src/routers/general'));
app.use('/livescore', require('./src/routers/livescore'));
app.use('/history', require('./src/routers/history'));
app.use('/rank', require('./src/routers/rank'));
app.use('/cashflow', require('./src/routers/cashflow'));
app.use('/cashflow_api', require('./src/routers/cashflow_api')); // 金流介接(gash)
app.use('/cashflow_neweb', require('./src/routers/cashflow_neweb')); // 金流介接(藍新)
app.use('/invoice_ezpay', require('./src/routers/invoice_ezpay')); // 電子發票介接(ezpay)
// keep firebase cloud function :API awake
app.use('/mission', require('./src/routers/mission'));
app.get('/awakeAPI', (req, res) => {
  console.log('is sport-test : ', process.env.GCLOUD_PROJECT !== 'sportslottery-test');
  console.log(process.env.GCLOUD_PROJECT);
  res.status(200).json(process.env);
});

// API cloud function
// exports.api = functions.runWith(env_values.runtimeOpts).https.onRequest(app);
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(process.env);
  console.log(',,,,,,,,,');
  console.log(process.env.NODE_ENV);
  console.log(process.env.PORT);
  console.log(process.env.development);
  console.log(process.env.production);
  console.log(`Example app listening at http://localhost:${port}`);
});
