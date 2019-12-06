/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');
const messageModel = require('../model/messageModel');

function getLastMessage(req, res) {
  const { channelId, limit, offset } = req.query;
  const args = {};
  channelId ? (args.channelId = channelId) : (args.channelId = 'public');
  offset ? (args.offset = Number.parseInt(offset)) : (args.offset = 0);
  limit ? (args.limit = Number.parseInt(limit)) : (args.limit = 50);
  args.token = req.token; // get from verification middleware
  // console.log('here', args.channelId);

  messageModel
    .getLastMessage(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(500).send(err);
    });
}
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
  args.token = req.token; // get from verification middleware
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
module.exports = {
  getMessageWithId,
  postMessage,
  deleteMessageWithId,
  getLastMessage
};
