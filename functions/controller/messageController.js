/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const messageModel = require('../model/messageModel');
const sc = require('../shortcut_function');

// All error handling is not complete yet

function getMessageWithKey(req, res) {
  let { key } = req.params;
  messageModel
    .getMessageWithKey(key)
    .then(function(body) {
      console.log('getMessageWithKey content:');
      console.log(body);
      res.json(body);
    })
    .catch(function(err) {
      res.status(500);
      res.send(err);
    });
}

function postMessage(req, res) {
  console.log('post messages 在這');
  messageModel
    .postMessage(req)
    .then(function(body) {
      console.log('postMessage content:');
      // console.log(body);
      res.json(body);
    })
    .catch(function(err) {
      res.status(500);
      res.send(err);
    });
}

function deleteMessage(req, res) {
  let { key } = req.params;
  messageModel
    .deleteMessage(key)
    .then(function(body) {
      console.log(body);
      res.send(body);
    })
    .catch(function(err) {
      res.status(500);
      res.send(err);
    });
}
module.exports = { getMessageWithKey, postMessage, deleteMessage };
