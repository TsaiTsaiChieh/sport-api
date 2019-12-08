/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const modules = require('../util/modules');
const messageModel = require('../model/messageModel');

// All error handling is not complete yet
/**
 * @api {get} /user/getUserProfile get User Profile
 * @apiVersion 1.0.0
 * @apiName get messages
 * @apiGroup Messages
 * @apiPermission login user
 *
 * @apiParam (Request cookie) {token} __session token generate from firebase Admin SDK
 *
 * @apiSuccess {JSON} success verify result success
 *
 * @apiSuccessExample Success-Response:
 *  HTTP/1.1 200 OK
 [
    {
        "message": {
            "channelId": "public",
            "messageId": "pOCYGzwhs98kgKuqzgAN",
            "replyMessageId": "S84shEIh7P1OL6l05Cuh",
            "message": "訊息已被刪除",
            "softDelete": 0,
            "tempHash": "1575016866607zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "createTime": {
                "seconds": 1575016865,
                "nanoseconds": 727000000
            }
        },
        "file": {
            "id": "3966060610_a5f857e4c3793f2a",
            "name": "獎牌ICON_190711_0009.jpg",
            "size": "200142",
            "type": "jpg",
            "farmHash": 3966060610,
            "sipHash": "a5f857e4c3793f2a"
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "S84shEIh7P1OL6l05Cuh",
            "replyMessageId": "6y4Wang3BG8ITciLU77C",
            "message": "訊息已被管理員刪除",
            "softDelete": "-1",
            "tempHash": "1575015219932zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "createTime": {
                "seconds": 1575015219,
                "nanoseconds": 469000000
            }
        },
        "file": {
            "id": "3625815968_20e553b10e968d65",
            "name": "logo1b.jpg",
            "size": "54990",
            "type": "jpg",
            "farmHash": 3625815968,
            "sipHash": "20e553b10e968d65"
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "6y4Wang3BG8ITciLU77C",
            "replyMessageId": "",
            "message": "訊息已被隱藏",
            "softDelete": "1",
            "tempHash": "f56f4gh4f",
            "createTime": {
                "seconds": 1575008924,
                "nanoseconds": 732000000
            }
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "VmJFUfMjEV3NaZjOqg6e",
            "replyMessageId": "",
            "message": "訊息內容",
            "softDelete": "1",
            "tempHash": "gyu35745",
            "createTime": {
                "seconds": 1575008546,
                "nanoseconds": 0
            }
        },
        "user": {
            "displayName": "測試displayName3",
            "avatar": "https://www.techrum.vn/chevereto/images/2016/05/05/Bkm4d.jpg",
            "title": "一般會員"
        }
    },
    {
        "message": {
            "channelId": "public",
            "messageId": "viain91ufYhx6reEVQNq",
            "replyMessageId": "",
            "message": "456",
            "softDelete": 2,
            "tempHash": "6d58yt4h6d",
            "createTime": {
                "seconds": 1575008486,
                "nanoseconds": 0
            }
        },
        "user": {
            "uid": "zmPF5Aht60Y6GdBbGnrOSlWcgV53",
            "displayName": "測試displayName",
            "avatar": "https://uploaded.firestorage.avatar.jpg"
        }
    }
]
 *
 * @apiError TokenMissing session cookie not exist.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Bad Request 
 *     Check request parameters
 *     HTTP/1.1 401 Unauthorized
 *     missing token
 */
function getLastMessage(req, res) {
  const schema = {
    type: 'object',
    required: ['limit', 'offset'],
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
      channelId: { type: 'string', default: 'public' }
    }
  };
  const { channelId, limit, offset } = req.query;
  const args = {};

  channelId ? args.channelId : '';
  limit ? (args.limit = Number.parseFloat(limit)) : '';
  offset ? (args.offset = Number.parseFloat(offset)) : '';
  args.token = req.token; // get from verification middleware
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
      res.status(500).send(err);
    });
}

function getMessageWithId(req, res) {
  const schema = {
    type: 'object',
    required: ['limit', 'offset'],
    properties: {
      limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
      offset: { type: 'integer', minimum: 0, default: 0 },
      channelId: { type: 'string', default: 'public' }
    }
  };
  const { id } = req.params;
  const args = {};
  id ? (args.id = id) : '';
  const valid = modules.ajv.validate(schema, args);
  if (!valid) {
    res.status(400).send(modules.ajv.errors);
  }

  messageModel
    .getMessageWithId(args.id)
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
