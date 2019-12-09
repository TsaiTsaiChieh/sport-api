/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');
const messageModel = require('../model/messageModel');

async function getLastMessage(req, res) {
  // if user login get the user info
  const session = req.cookies.__session;

  let decodedIdToken;
  if (session) {
    decodedIdToken = await modules.firebaseAdmin
      .auth()
      .verifySessionCookie(session, true);
  }
  const schema = {
    type: 'object',
    required: ['limit', 'offset'],
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
      channelId: { type: 'string', default: 'public' }
    }
  };

  const args = {};
  req.query.channelId ? args.channelId : '';
  req.query.limit ? (args.limit = Number.parseFloat(req.query.limit)) : '';
  req.query.offset ? (args.offset = Number.parseFloat(req.query.offset)) : '';
  args.token = decodedIdToken; // get from verifySessionCookie

  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    res.status(400).send(modules.ajv.errors);
  }

  messageModel
    .getLastMessage(args)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).send(err.error);
    });
}

function getMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  };

  const args = {};
  req.params.id ? (args.id = req.params.id) : '';
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    res.status(400).send(modules.ajv.errors);
    return;
  }

  messageModel
    .getMessageWithId(args.id)
    .then(function(body) {
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).send(err.error);
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
      res.status(err.code).send(err.error);
    });
}

function deleteMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['id', 'deleteAction'],
    properties: {
      id: { type: 'string' },
      deleteAction: { type: 'integer', minimum: -1, maximum: 1 }
    }
  };
  const args = {};
  req.params.id ? (args.id = req.params.id) : '';
  req.body.deleteAction || req.body.deleteAction === 0
    ? (args.deleteAction = Number.parseFloat(req.body.deleteAction))
    : '';
  args.token = req.token; // get from verification middleware

  const valid = modules.ajv.validate(schema, args);

  if (!valid) {
    res.status(400).send(modules.ajv.errors);
    return;
  }
  messageModel
    .deleteMessageWithId(args)
    .then(function(body) {
      // console.log(body);
      res.json(body);
    })
    .catch(function(err) {
      res.status(err.code).send(err.error);
    });
}
module.exports = {
  getMessageWithId,
  postMessage,
  deleteMessageWithId,
  getLastMessage
};
