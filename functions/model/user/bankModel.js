
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
            
            const bank = await db.sequelize.query(
                `
                UPDATE user__banks
                SET bank_code=$bank_code, bank_username=$bank_username, bank_account=$bank_account
                WHERE uid = $uid
                `,
                {
                    bind: { uid: uid, bank_code:bank_code, bank_username:bank_username, bank_account:bank_account },
                    type: db.sequelize.QueryTypes.UPDATE
                });
                
            if(!bank[1]){
                const bank = await db.sequelize.query(
                    `
                    INSERT INTO user__banks (uid, bank_code, bank_username, bank_account)
                    VALUES ($uid, $bank_code, $bank_username, $bank_account)
                    `,
                    {
                        bind: { uid: uid, bank_code:bank_code, bank_username:bank_username, bank_account:bank_account },
                        type: db.sequelize.QueryTypes.INSERT
                    });
                data = {
                    'code':'200',
                    'message':'新增成功'
                }
            }else{
                data = {
                    'code':'200',
                    'message':'更新成功'
                }
            }
            resolve(data);
                
            
        }
    } catch (err) {
      console.log('Error in  rank/searchUser by henry:  %o', err);
      return reject(errs.errsMsg('500', '500', err.message));
    }
  });
}

module.exports = bankModel;
