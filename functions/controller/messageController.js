/* eslint-disable promise/always-return */
/* eslint-disable prefer-arrow-callback */
const messageModel = require('../model/messageModel');

function getMessageWithKey(req, res) {
  console.log('get messages id 在這');
  let { key } = req.params;
  messageModel
    .getMessageWithKey(key)
    .then(function(body) {
      console.log('getMessageWithKey content:', body);
      res.json(body);
    })
    .catch(function(error) {
      res.send(error);
    });
}
module.exports = { getMessageWithKey };
