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
      res.status(500).send(err);
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
      res.status(500).send(err);
    });
}

function deleteMessageWithId(req, res) {
  const args = {};
  args.messageId = req.params.id;
  args.token = req.token;
  let deleteAction = Number.parseInt(req.body.deleteAction);
  if (isNaN(deleteAction) || Math.abs(deleteAction) > 1) {
    const err = modules.createError(
      406,
      'Delete action request is not acceptable'
    );
    res.status(err.code).send(err.error);
    return;
  }
  args.deleteAction = deleteAction;
  messageModel
    .deleteMessageWithId(args)
    .then(function(body) {
      // console.log(body);
      res.json(body);
    })
    .catch(function(err) {
      // console.log(err);
      res.status(err.code).send(err.error);
    });
}
module.exports = { getMessageWithId, postMessage, deleteMessageWithId };
