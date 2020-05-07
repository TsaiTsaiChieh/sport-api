
// code: {msg(給前端使用): '', backend(後端使用): [自行輸入，目前顯示第一個] }
const errorCodeLists = {
  1301: { msg: ['使用者狀態異常'], backend: ['使用者不存在', 'User does not exist. Please sign in again.'] },
  1302: { msg: ['使用者狀態異常'], backend: ['使用者不是一般使用者、大神，請確認使用者狀態', ''] },
  1303: { msg: ['使用者沒有預測單'], backend: ['使用者沒有預測單', 'User does not have predictions info.'] },
  1304: { msg: ['使用者一天只能擁有一份預測清單'], backend: ['使用者一天只能擁有一份預測清單', 'User can not own predictions more than one predictions list of one day.'] },
  1305: { msg: ['user status abnormal'], backend: ['使用者不存在', 'user not found.'] },
  1306: { msg: ['user status abnormal'], backend: ['users_titles doc 找不到', 'users_titles doc not found'] },
  1307: { msg: ['delete failed'], backend: ['欲刪除的在 doc 找不到', 'delete something not (found) in the doc'] },
  1308: { msg: ['使用者狀態異常'], backend: ['使用者不是管理者，請確認使用者狀態', ''] },
  1309: { msg: ['更新 比賽 失敗'], backend: ['更新 matches spread_result, totals_result 失敗', ''] },
  1310: { msg: ['更新 比賽 失敗'], backend: ['更新 matches spread_result, totals_result 異常 筆數不正確，只能一筆才對', ''] },
  1311: { msg: ['更新 比賽 失敗'], backend: ['更新 賽事結算讓分 結果異常，不應該為空白', ''] },
  1312: { msg: ['更新 比賽 失敗'], backend: ['更新 賽事結算大小 結果異常，不應該為空白', ''] },
  1313: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 user__predictions spread_result, totals_result 失敗', ''] },
  1314: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 user__predictions spread_result, totals_result 異常 筆數不正確，只能一筆才對', ''] },
  1315: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 user__predictions 賽事結算讓分 結果異常，不應該為空白', ''] },
  1316: { msg: ['更新 使用者預測單 失敗'], backend: ['更新 user__predictions 賽事結算大小 結果異常，不應該為空白', ''] },
  1317: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 users__win_lists_history 失敗', ''] },
  1318: { msg: ['更新 使用者勝注勝率歷史資料 失敗'], backend: ['更新 users__win_lists_history 異常 筆數不正確，只能一筆才對', ''] },
  1319: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists 失敗', ''] },
  1320: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists 資料欄位 異常 筆數不正確，只能一筆才對', ''] },
  1321: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 Title 失敗', ''] },
  1322: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists 失敗 異常 筆數不正確，要五筆才對', ''] },
  1323: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['非數字情況，可能原因是自串相加、資料為空字串', ''] },
  1324: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Titles 異常 筆數不正確，只能一筆才對', ''] },
  1325: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists_history 失敗 ', 'Create users__win_lists_history 產生 ER_LOCK_DEADLOCK'] },
  1326: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists_history 失敗 ', 'Create users__win_lists_history 產生 ER_DUP_ENTRY'] },
  1327: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 users__win_lists_history 失敗 ', 'Create users__win_lists_history 不明原因錯誤'] },
  1328: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists_history 失敗 ', 'Update users__win_lists_history 產生 ER_LOCK_DEADLOCK'] },
  1329: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists_history 失敗 ', 'Update users__win_lists_history 產生 ER_DUP_ENTRY'] },
  1330: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 users__win_lists_history 失敗 ', 'Update users__win_lists_history 不明原因錯誤'] },
  1331: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists失敗 ', 'Create users__win_lists 產生 ER_LOCK_DEADLOCK'] },
  1332: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists 失敗 ', 'Create users__win_lists 產生 ER_DUP_ENTRY'] },
  1333: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 users__win_lists 失敗 ', 'Create users__win_lists 不明原因錯誤'] },
  1334: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists失敗 失敗 ', 'Update users__win_lists失敗 產生 ER_LOCK_DEADLOCK'] },
  1335: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists失敗 失敗 ', 'Update users__win_lists失敗 產生 ER_DUP_ENTRY'] },
  1336: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['新增 users__win_lists失敗 失敗 ', 'Update users__win_lists失敗 不明原因錯誤'] },
  1337: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Title 失敗 ', 'Update Title 產生 ER_LOCK_DEADLOCK'] },
  1338: { msg: ['更新 大神稱號 失敗'], backend: ['更新 Title 失敗 ', 'Update Title 產生 ER_DUP_ENTRY'] },
  1339: { msg: ['更新 大神稱號 失敗'], backend: ['新增 Title 失敗 ', 'Update Title 不明原因錯誤'] },
  1340: { msg: ['更新 使用者勝注勝率資料 失敗'], backend: ['更新 users__win_lists失敗 失敗 ', ''] }
};

function errsMsg(serverCode, backendcode, otherMsg = '', showOrder = 0) { // othermsg 當 500 或 特殊情況 可以自行輸入
  showOrder = [0].includes(showOrder) ? showOrder : 0; // 給顯示順序給一個預設值0，將來多國可以設定 1 英文之類

  // otherMsg 特殊情況強制輸出 否則 先檢查 errorCode 是否存在，目前 500 err 預設顯示是 err.message，將來可以 err.stack
  return otherMsg
    ? { code: serverCode, err: { code: backendcode, msg: (typeof otherMsg === 'string') ? otherMsg : otherMsg.message } }
    : Object.keys(errorCodeLists).includes(backendcode)
      ? { code: serverCode, err: { code: backendcode, msg: errorCodeLists[backendcode].msg[showOrder] } }
      : serverCode !== 500
        ? { code: 500, err: { code: 500, msg: `${backendcode} 該後端code不存在!` } }
        : { code: 500, err: { code: 500, msg: '呼叫錯誤顯示方式錯誤！' } };
}

module.exports = { errsMsg };
