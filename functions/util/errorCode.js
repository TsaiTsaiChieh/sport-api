
// code: {msg(給前端使用): '', backend(後端使用): [自行輸入，目前顯示第一個] }
const errorCodeLists = {
  1301: { msg: ['使用者狀態異常'], backend: ['使用者不存在', 'User does not exist. Please sign in again.'] },
  1302: { msg: ['使用者狀態異常'], backend: ['使用者不是一般使用者、大神，請確認使用者狀態', ''] },
  1303: { msg: ['使用者沒有預測單'], backend: ['使用者沒有預測單', 'User does not have predictions info.'] },
  1304: { msg: ['使用者一天只能擁有一份預測清單'], backend: ['使用者一天只能擁有一份預測清單', 'User can not own predictions more than one predictions list of one day.'] },
  1305: { msg: ['user status abnormal'], backend: ['使用者不存在', 'user not found.'] },
  1306: { msg: ['user status abnormal'], backend: ['users_titles doc 找不到', 'users_titles doc not found'] },
  1307: { msg: ['delete failed'], backend: ['欲刪除的在 doc 找不到', 'delete something not (found) in the doc'] },
  1323: { msg: ['非數字'], backend: ['非數字', ''] },

  1308: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },
  130810: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },
  130815: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },
  130820: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },
  130825: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },
  130830: { msg: ['使用者狀態異常'], backend: ['使用者權限不正確，請確認使用者權限', ''] },

  13001: { msg: ['更新 使用者 失敗'], backend: ['更新 Update Users default_god_league_rank 失敗 資料庫原因錯誤', ''] },
  13002: { msg: ['更新 使用者 失敗'], backend: ['更新 Update Users default_god_league_rank 失敗 非大神不能更新', ''] },

  13101: { msg: ['查詢 賽事 失敗'], backend: ['該比賽  無相關資料，可能原因 多筆、無效比賽、未完賽、最終得分未寫入資料!', ''] },
  13109: { msg: ['更新 賽事 失敗'], backend: ['更新 Update matches spread_result, totals_result 失敗 資料庫原因錯誤', ''] },
  13110: { msg: ['更新 賽事 失敗'], backend: ['更新 Update matches spread_result, totals_result 異常 筆數不正確，只能一筆才對', ''] },
  13111: { msg: ['更新 賽事 失敗'], backend: ['更新 賽事結算讓分 結果異常，不應該為空白', ''] },
  13112: { msg: ['更新 賽事 失敗'], backend: ['更新 賽事結算大小 結果異常，不應該為空白', ''] },
  13141: { msg: ['更新 賽事 失敗'], backend: ['更新 Update matches 失敗 ER_LOCK_DEADLOCK', ''] },
  13142: { msg: ['更新 賽事 失敗'], backend: ['更新 Update matches 失敗 ER_DUP_ENTRY', ''] },

  13213: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions spread_result, totals_result 失敗 資料庫原因錯誤', ''] },
  13214: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions spread_result, totals_result 異常 筆數不正確，只能一筆才對', ''] },
  13215: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions 賽事結算讓分 結果異常，不應該為空白', ''] },
  13216: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions 賽事結算大小 結果異常，不應該為空白', ''] },
  13243: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions 失敗 ER_LOCK_DEADLOCK', ''] },
  13244: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 Update user__predictions 失敗 ER_DUP_ENTRY', ''] },

  13317: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 Update users__win_lists_history 失敗', ''] },
  13318: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 Update users__win_lists_history 異常 筆數不正確，只能一筆才對', ''] },
  13325: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['新增 Create users__win_lists_history 失敗 ER_LOCK_DEADLOCK', ''] },
  13326: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['新增 Create users__win_lists_history 失敗 ER_DUP_ENTRY ', ''] },
  13327: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['新增 Create users__win_lists_history 失敗 資料庫原因錯誤', ''] },
  13328: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 Update users__win_lists_history 失敗 ER_LOCK_DEADLOCK', ''] },
  13329: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 Update users__win_lists_history 失敗 ER_DUP_ENTRY', ''] },
  13330: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 Update users__win_lists_history 失敗 資料庫原因錯誤', ''] },

  13419: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 失敗', ''] },
  13420: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 資料欄位 異常 筆數不正確，只能一筆才對', ''] },
  13422: { msg: ['檢查 使用者勝注勝率資料 異常'], backend: ['檢查 是否有6筆資料', ''] },
  13434: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 失敗 ER_LOCK_DEADLOCK', ''] },
  13435: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 失敗 ER_DUP_ENTRY', ''] },
  13436: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 失敗 資料庫原因錯誤', ''] },
  13431: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 Create users__win_lists 失敗 ER_LOCK_DEADLOCK', ''] },
  13432: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 Create users__win_lists 失敗 ER_DUP_ENTRY', ''] },
  13433: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 Create users__win_lists 失敗 資料庫原因錯誤', ''] },
  13440: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Update users__win_lists 失敗 ', ''] },

  13501: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 ER_LOCK_DEADLOCK', ''] },
  13502: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 ER_DUP_ENTRY', ''] },
  13503: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 資料庫原因錯誤', ''] },
  13524: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 異常 筆數不正確，只能一筆才對', ''] },
  13537: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 ER_LOCK_DEADLOCK', ''] },
  13538: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 ER_DUP_ENTRY', ''] },
  13539: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 資料庫原因錯誤', ''] },
  13540: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles receive 失敗 資料庫原因錯誤', ''] },
  13541: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 資料庫原因錯誤', ''] },
  13542: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles 失敗 無對應 league 無法更新 default_title', ''] },
  13543: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Update Titles receive 失敗 資料庫原因錯誤', ''] }
};

const isError = e => e && e.stack && e.message;

function dbErrsMsg(serverCode, backendcode, property = { custMsg: '', showOrder: 0 }) {
  // 準備針對 DB錯誤記錄
  return errsMsg(serverCode, backendcode, property);
}

// 當有變數要顯示在字串內時，可以用 { msg: `ooxxooxx ${bets_id} ooxxooxx` } msg會自動取代
function errsMsg(serverCode, backendcode, property = { custMsg: '', showOrder: 0 }) { // custMsg 當 500 或 特殊情況 可以自行輸入
  let showOrder = property.showOrder;
  const custMsg = property.custMsg;
  showOrder = [0].includes(showOrder) ? showOrder : 0; // 給顯示順序給一個預設值0，將來多國可以設定 1 英文之類

  // custMsg 特殊情況強制輸出 否則 先檢查 errorCode 是否存在，目前 500 err 預設顯示是 err.message，將來可以 err.stack
  return custMsg
    ? {
      code: serverCode,
      err: {
        code: backendcode,
        msg: (typeof custMsg === 'string') ? custMsg
          : isError(custMsg) ? custMsg.message
            : JSON.stringify(custMsg)
      }
    }
    : Object.keys(errorCodeLists).includes(backendcode)
      ? { code: serverCode, err: { code: backendcode, msg: errorCodeLists[backendcode].msg[showOrder] } }
      : serverCode !== 500
        ? { code: 500, err: { code: 500, msg: `${backendcode} 該後端code不存在!` } }
        : { code: 500, err: { code: 500, msg: '呼叫錯誤顯示方式錯誤！' } };
}

module.exports = { dbErrsMsg, errsMsg };
