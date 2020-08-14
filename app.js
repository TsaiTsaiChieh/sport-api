require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
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

const corsList = process.env.corsList.split(',');
const corsOptions = {
  origin: function(origin, callback) {
    if (corsList.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      console.log('Not allowed by CORS', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));

app.use(express.json());
app.use('/test', require('./src/routers/test'));
app.use('/auth', require('./src/routers/authentication'));
app.use('/user', require('./src/routers/user'));
app.use('/messages', require('./src/routers/messages'));
app.use('/sport', require('./src/routers/sport'));
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
app.use('/mission', require('./src/routers/mission'));
app.get('/awakeAPI', (req, res) => {
  const { name, version } = require('./package');
  res.status(200).json({ [name]: version });
});

// API cloud function
// exports.api = functions.runWith(env_values.runtimeOpts).https.onRequest(app);
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Getsport API listening at http://localhost:${port}`);
});

server.keepAliveTimeout = 60 * 1000;
