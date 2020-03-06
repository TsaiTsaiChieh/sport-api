// const ssr = require('./server/index.js');

/* eslint-disable no-unused-vars */
const functions = require("firebase-functions");
const express = require("express");
const cors = require("cors");

let bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodeSchedule = require("node-schedule");
const app = express();

app.use(cookieParser());
app.disable("x-powered-by");
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.xssFilter());

app.use(helmet.frameguard());

app.use(
  bodyParser.json({
    limit: "50mb",
    extended: true
  })
);
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);

const whitelist = [
  "https://chat.doinfo.cc",
  "https://doinfo.cc",
  "http://localhost:5000",
  "http://localhost:8080",
  "http://localhost:8081"
];
const corsOptions = {
  credential: true,
  origin: function(origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
};
app.use(cors(corsOptions));

app.use(express.json());
app.use("/admin", require("./router/admin"));
app.use("/auth", require("./router/authentication"));
app.use("/user", require("./router/user"));
app.use("/messages", require("./router/messages"));
app.use("/sport", require("./router/sport"));
app.use("/messages_temp", require("./Deprecated/messages"));

// for test pubsub endpoint
app.use("/radar/prematch", require("./pubsub/prematch"));
app.use("/radar/checkmatch_NBA", require("./pubsub/checkmatch_NBA"));
app.use("/radar/checkmatch_MLB", require("./pubsub/checkmatch_MLB"));

exports.cronPrematch = functions.pubsub
  .schedule("0 5 * * *")
  .timeZone("Asia/Taipei")
  .onRun(require("./pubsub/prematch"));
exports.cronHandicap = functions.pubsub
  .schedule("*/30 * * * *")
  .timeZone("Asia/Taipei")
  .onRun(require("./pubsub/getHandicap"));
exports.cronCheckmatch_NBA = functions.pubsub
  .schedule("* * * * *")
  .timeZone("Asia/Taipei")
  .onRun(require("./pubsub/checkmatch_NBA"));
exports.cronCheckmatch_MLB = functions.pubsub
  .schedule("* * * * *")
  .timeZone("Asia/Taipei")
  .onRun(require("./pubsub/checkmatch_MLB"));
exports.api = functions.https.onRequest(app);
// exports.ssr = functions.https.onRequest(ssr.app);
