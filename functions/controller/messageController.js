/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');
const messageModel = require('../model/messageModel');

// All error handling is not complete yet
function getMessageWithId(req, res) {
  let { id } = req.params;
  messageModel
    .getMessageWithId(id)
    .then(function(body) {
      // console.log('getMessageWithId content:');
      // console.log(body);
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

function deleteMessageWithId(req, res) {
  let { id } = req.params;
  let deleteAction = Number.parseInt(req.body.deleteAction);
  if (isNaN(deleteAction)) {
    const err = modules.createError(
      406,
      'Delete action request is not acceptable'
    );
    res.status(err.code);
    res.send(err.error);
    return;
  }
  messageModel
    .deleteMessageWithId(id)
    .then(function(body) {
      // console.log(body);
      res.json(body);
    })
    .catch(function(err) {
      // console.log(err);
      res.status(err.code);
      res.send(err.error);
    });
}
module.exports = { getMessageWithId, postMessage, deleteMessageWithId };
