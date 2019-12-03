/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const messageModel = require('../model/messageModel');

// All error handling is not complete yet
function getMessageWithId(req, res) {
  let { id } = req.params;
  messageModel
    .getMessageWithId(id)
    .then(function(body) {
      console.log('getMessageWithId content:');
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
  let { id } = req.params;
  messageModel
    .deleteMessage(id)
    .then(function(body) {
      console.log(body);
      res.send(body);
    })
    .catch(function(err) {
      res.status(500);
      res.send(err);
    });
}
module.exports = { getMessageWithId, postMessage, deleteMessage };
