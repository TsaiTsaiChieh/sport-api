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
      category: {
        type: 'string',
        enum: ['賽事分析', '球隊討論', '投注分享']
      },
      type: {
        type: 'string',
        enum: ['MLB', 'NBA']
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
}

module.exports = createTopic;