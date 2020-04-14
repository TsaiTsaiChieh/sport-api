/* eslint-disable promise/always-return */
const modules = require('../../util/modules');
const topicModel = require('../../model/topics/createTopicModel');
async function createTopic(req, res) {

/// 聯盟、看板、標題、文章（html格式）
// content:{
//   category: category, [賽事分析,球隊討論,投注分享]
//   type: type, [MLB,NBA]
//   title: title,
//   content: content,
// },

  const schema = {
    type: 'object',
    requied: ['category', 'type', 'title', 'content'],
    properties: {
      type: {
        type: 'string',
        enum: ['MLB', 'NBA']
      },
      category: {
        type: 'string',
        enum: ['賽事分析', '球隊討論', '投注分享']
      },
      title: {
        type: 'string',
        maxLength: 50
      },
      content: {
        type: 'string',
      }
    }
  }

  const valid = modules.ajv.validate(schema, req.body);
  if (!valid) {
    res.status(400).json(modules.ajv.errors);
    return;
  }
  req.body.token = req.token;
  const args = req.body;
  
  topicModel(args)
  .then(function(body) {
    res.json(body);
  })
  .catch(function(err) {
    res.status(err.code).json(err);
  });
}

module.exports = createTopic;