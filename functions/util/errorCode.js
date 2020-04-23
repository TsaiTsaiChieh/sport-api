
// code: {msg(給前端使用): '', backend(後端使用): [自行輸入，目前顯示第一個] }
const errorCodeLists = {
  1301: { msg: ['使用者狀態異常'], backend: ['使用者不存在', 'User does not exist. Please sign in again.'] },
  1302: { msg: ['使用者狀態異常'], backend: ['使用者不是一般使用者、大神，請確認使用者狀態', ''] },
  1303: { msg: ['使用者沒有預測單'], backend: ['使用者沒有預測單', 'User does not have predictions info.'] },
  1304: { msg: ['使用者一天只能擁有一份預測清單'], backend: ['使用者一天只能擁有一份預測清單', 'User can not own predictions more than one predictions list of one day.'] },
  1305: { msg: ['user status abnormal'], backend: ['使用者不存在', 'user not found.'] },
  1306: { msg: ['user status abnormal'], backend: ['users_titles doc 找不到', 'users_titles doc not found'] },
  1307: { msg: ['delete failed'], backend: ['欲刪除的在 doc 找不到', 'delete something not (found) in the doc'] }
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
