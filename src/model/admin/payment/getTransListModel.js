const db = require('../../../util/dbUtil');
const func = require('../../topics/topicFunctions');
const Op = require('sequelize').Op;
const countPerPage = 20;

function getBankInfo(users) {
  return new Promise(async function(resolve, reject) {
    try {
      const result = await db.sequelize.models.user__bank.findAll({
        attributes: [
          'uid',
          'bank_code',
          'bank_username',
          'bank_account'
        ],
        where: {
          uid: {
            [Op.or]: users
          }
        },
        raw: true
      });
      resolve(result);
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
};

async function model(args) {
  return new Promise(async function(resolve, reject) {
    try {
      const where = {
        status: 1
      };
      if (args.cash_status || args.cash_status === 0) where.cash_status = args.cash_status;
      if (args.uid) where.uid = args.uid;

      console.log(args.cash_status);
      console.log(where);
      const res = await db.sequelize.models.cashflow_ingot_transfer.findAndCountAll({
        where: where,
        limit: countPerPage, // 每頁幾個
        offset: countPerPage * args.page, // 跳過幾個 = limit * index
        raw: true
      });
      /* 讀取一些別的資料 */
      let usersToGet = [];
      let usersInfo = [];
      let banksInfo = [];
      for (let i = 0; i < res.rows.length; i++) {
        usersToGet.push(res.rows[i].uid);
      }
      /* 去除重複的 */
      usersToGet = [...new Set(usersToGet)];
      /* 讀取user info */
      try {
        usersInfo = await func.getUserInfo(usersToGet);
        banksInfo = await getBankInfo(usersToGet);
      } catch (error) {
        console.error(error);
        reject({ code: 500, error: 'get user info failed' });
      }

      for (let i = 0; i < res.rows.length; i++) {
        let userInfo = usersInfo.filter(obj => obj.uid === res.rows[i].uid.toString());
        userInfo = userInfo[0] ? userInfo[0] : null;
        res.rows[i].user_info = userInfo;
      }
      for (let i = 0; i < res.rows.length; i++) {
        let bankInfo = banksInfo.filter(obj => obj.uid === res.rows[i].uid.toString());
        bankInfo = bankInfo[0] ? bankInfo[0] : null;
        res.rows[i].bank_info = bankInfo;
      }

      resolve({ code: 200, count: res.count, data: res.rows });
    } catch (err) {
      console.error(err);
      reject({ code: 500, error: err });
    }
  });
}
module.exports = model;
