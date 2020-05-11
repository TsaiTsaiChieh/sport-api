
const errs = require('../../util/errorCode');
const db = require('../../util/dbUtil');

function bankModel(args, method, uid) {
  return new Promise(async function(resolve, reject) {
    try {
     
        if(method=="POST"){
            const bank = await db.sequelize.query(
                `
                SELECT bank_code, bank_username, bank_account
                    FROM user__banks
                WHERE uid = $uid
                `,
                {
                    plain: true,
                    bind: { uid: uid },
                    type: db.sequelize.QueryTypes.SELECT
                });

            const purseList = {
                bank
            };
            resolve(purseList);
        }else if(method=="PUT"){
            let data = {};
            const bank_code = args.bank_code;
            const bank_username = args.bank_username;
            const bank_account = args.bank_account;
            
            const bank = await db.Bank.upsert({
                uid:uid,
                bank_code     : bank_code,
                bank_username : bank_username,
                bank_account  : bank_account
            });
                
            data = {
                "code":"200",
                "message":"新增/更新成功"
            };
            resolve(data);
                
            
        }
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = bankModel;
