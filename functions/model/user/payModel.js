const db = require('../../util/dbUtil');

function payModel(method, args, uid) {
  return new Promise(async function(resolve, reject) {
    try {
      let trans = [];
      if (method === 'PUT') {
        const type = args.type;
        const ingot = args.ingot || 0;
        const coin = args.coin || 0;
        const dividend = args.dividend || 0;

        if (type === 'buy_coin') {
          trans = await db.sequelize.query(
                `
                    UPDATE users 
                       SET coin = (coin + $coin), 
                           dividend = (dividend + $dividend) 
                     WHERE uid = $uid
                `,
                {
                  bind: { coin: coin, dividend: dividend, uid: uid },
                  type: db.sequelize.QueryTypes.UPDATE
                }
          );
        } else if (type === 'ingot2coin') {
          /* 提領比例計算 */
          let ratio = 0;
          if (ingot <= 3000) {
            ratio = 0.015;
          } else if (ingot > 3000 && ingot < 10000) {
            ratio = 0.01;
          } else {
            ratio = 0.005;
          }

          const pre_purse = await db.sequelize.query(
                    `
                        SELECT coin, dividend, ingot
                            FROM users 
                        WHERE uid = $uid
                    `,
                    {
                      plain: true,
                      bind: { uid: uid },
                      type: db.sequelize.QueryTypes.SELECT
                    });
          if ((pre_purse.ingot - ingot) < 0) {
            const err = {
              code: '400',
              msg: 'Transfer failed! Due to the transfer ingots is higher than you have:('
            };
            resolve(err);
          } else {
            trans = await db.sequelize.query(
                        `
                            UPDATE users 
                            SET coin = (coin + (1-$ratio)*$ingot), 
                                ingot = (ingot - $ingot) 
                            WHERE uid = $uid  
                        `,
                        {
                          bind: { coin: coin, ingot: ingot, uid: uid, ratio: ratio },
                          type: db.sequelize.QueryTypes.UPDATE
                        }
            );
          }
        } else {
          console.log('您尚未選擇任何一項類別!');
        }
        const purse = await db.sequelize.query(
            `
            SELECT coin, dividend, ingot
                FROM users 
            WHERE uid = $uid
            `,
            {
              plain: true,
              bind: { uid: uid },
              type: db.sequelize.QueryTypes.SELECT
            });
        const payList = {
          // eslint-disable-next-line no-undef
          status: trans[1],
          purse: purse
        };
        resolve(payList);
      }
    } catch (err) {
      console.log('error happened...', err);
      reject({ code: 500, error: err });
    }
  });
}

module.exports = payModel;
