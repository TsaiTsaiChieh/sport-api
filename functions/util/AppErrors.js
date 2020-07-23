const httpStatus = require('http-status');
/**
 * @extends Error
 */
class ExtendableError extends Error {
  constructor(message, status, isPublic, code) {
    super(message);
    this.message = message;
    this.name = this.constructor.name;
    this.status = status;
    this.isPublic = isPublic;
    this.code = code;
    // this.isOperational = true; // This is required since bluebird 4 doesn't append it anymore.
    Error.captureStackTrace(this, this.constructor.name);
  }
}
/* --------------------------- 200 OK --------------------------- */
class UserPredictFailed extends ExtendableError {
  constructor(message, status = 1000, isPublic = true, code = httpStatus.OK) {
    super(message, status, isPublic, code);
  }
}
class DeletePredictionsFailed extends ExtendableError {
  constructor(message, status = 1001, isPublic = true, code = httpStatus.OK) {
    super(message, status, isPublic, code);
  }
}

class UserPredictSomeFailed extends ExtendableError {
  constructor(message, status = 1002, isPublic = true, code = httpStatus.OK) {
    super(message, status, isPublic, code);
  }

  get getError() {
    return { error: this.constructor.name, message: this.message, devcode: this.status };
  }
}
/* --------------------------- 404 NOT FOUND --------------------------- */
/**
 * 找不到使用者資料 Error
 * @extends ExtendableError
 */
class UserNotFound extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - error message
   * @param {number} status - HTTP status code of error
   * @param {boolean} isPublic - whether the message should be visible to user or not
   */
  constructor(
    message = '無此使用者',
    status = 1305,
    isPublic = true,
    code = httpStatus.NOT_FOUND
  ) {
    super(message, status, isPublic, code);
  }
}

class BetsAPIError extends ExtendableError {
  constructor(
    message = '取得 BetsAPI 異常',
    status = 1308,
    isPublic = true,
    code = httpStatus.NOT_FOUND
  ) {
    super(message, status, isPublic, code);
  }
}

class MatchNotFound extends ExtendableError {
  constructor(
    message = '無任何賽事',
    status = 1309,
    isPublic = true,
    code = httpStatus.NOT_FOUND
  ) {
    super(message, status, isPublic, code);
  }
}

class GodUserNotFound extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - error message
   * @param {number} status - HTTP status code of error
   * @param {boolean} isPublic - whether the message should be visible to user or not
   */
  constructor(
    message = '找不到此大神',
    status = 1310,
    isPublic = true,
    code = httpStatus.NOT_FOUND
  ) {
    super(message, status, isPublic, code);
  }
}
/* --------------------------- 403 FORBIDDEN --------------------------- */
class UserCouldNotSell extends ExtendableError {
  constructor(
    message = '使用者非法操作',
    status = 1201,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class GodSellInconsistent extends ExtendableError {
  constructor(
    message = '大神和當日的販售狀態不一致',
    status = 1203,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
class GodSellStatusWrong extends ExtendableError {
  constructor(
    message = '非法的大神販售狀態',
    status = 1204,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
class UserNotBelongToGod extends ExtendableError {
  constructor(
    message = '使用者非大神玩家',
    status = 1205,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
class CouldNotFillInSellInformation extends ExtendableError {
  constructor(
    message = '無法填寫售牌資料',
    status = 1206,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class CouldNotModifySellInformation extends ExtendableError {
  constructor(
    message = '只能在當天最後一場賽事開賽前新增/編輯售牌資訊',
    status = 1207,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class OnlyAcceptUserDoesNotBelongsToCertainLeague extends ExtendableError {
  constructor(
    message = '刪除只允許非屬於該聯盟的大神玩家操作',
    status = 1208,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class GodUserDidNotSell extends ExtendableError {
  constructor(
    message = '大神該日無販售賽事',
    status = 1209,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
class CoinOrDividendNotEnough extends ExtendableError {
  constructor(
    message = '搞幣或紅利不足',
    status = 1210,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class PurchaseTimeShouldBeforeLastMatch extends ExtendableError {
  constructor(
    message = '已開賽，無法購買',
    status = 1212,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}

class CouldNotBuyOwnPredictions extends ExtendableError {
  constructor(
    message = '無法購買自己的預測',
    status = 1211,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
/* --------------------------- 500  INTERNAL SERVER ERROR --------------------------- */
class MysqlError extends ExtendableError {
  constructor(
    message = 'MySQL 錯誤',
    status = 1500,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class SettlementAccordingMatch extends ExtendableError {
  constructor(
    message = '結算所有完賽的賽事排程錯誤',
    status = 1501,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class PrematchEsoccerError extends ExtendableError {
  constructor(
    message = '電競足球賽前排程錯誤',
    status = 1502,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class FirebaseCollectError extends ExtendableError {
  constructor(
    message = 'Firebase 錯誤 | 存入 collection 錯誤',
    status = 1503,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class FirebaseRealtimeError extends ExtendableError {
  constructor(
    message = 'Firebase 錯誤 | 存入 realtime 錯誤',
    status = 1504,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class AxiosError extends ExtendableError {
  constructor(
    message = 'Axios 錯誤',
    status = 1505,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class HandicapEsoccerError extends ExtendableError {
  constructor(
    message = '電競足球盤口排程錯誤',
    status = 1506,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class PBPEsoccerError extends ExtendableError {
  constructor(
    message = '電競足球文字直播排程錯誤',
    status = 1507,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class PBPNBAError extends ExtendableError {
  constructor(
    message = 'NBA文字直播排程錯誤',
    status = 1508,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class PBPMLBError extends ExtendableError {
  constructor(
    message = 'MLB文字直播排程錯誤',
    status = 1509,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class PBPKBOError extends ExtendableError {
  constructor(
    message = 'KBO文字直播排程錯誤',
    status = 1511,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class PBPAbnormalError extends ExtendableError {
  constructor(
    message = 'checkmatch_abnormal排程錯誤',
    status = 1512,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
class RepackageError extends ExtendableError {
  constructor(
    message = '資料重新包裝錯誤',
    status = 1510,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class firestoreQueryError extends ExtendableError {
  constructor(
    message = 'Firestore查詢失敗',
    status = 1513,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class PurchasePredictionsModelError extends ExtendableError {
  constructor(
    message = '購買預測 API 錯誤',
    status = 1514,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class UpdateUserCoinAndDividend extends ExtendableError {
  constructor(
    message = '更新使用者搞幣或紅利失敗 (users table)',
    status = 1515,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class PropertyMissingError extends ExtendableError {
  constructor(
    message = '資料欄位缺漏 (undefined)',
    status = 1516,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class UnknownLeague extends ExtendableError {
  constructor(
    message = '未知的聯盟',
    status = 1517,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class CreateUserBuysTableRollback extends ExtendableError {
  constructor(
    message = '寫入使用者購買表的回滾',
    status = 1518,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class UpdateUserCoinORDividendRollback extends ExtendableError {
  constructor(
    message = '更新購買者搞幣或紅利的回滾',
    status = 1519,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class CreateCashflowBuyRollback extends ExtendableError {
  constructor(
    message = '寫入購買者金流表的回滾',
    status = 1520,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class PredictionHistoryModelError extends ExtendableError {
  constructor(
    message = '歷史紀錄 API 錯誤',
    status = 1521,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class CrawlersError extends ExtendableError {
  constructor(
    message = '爬蟲發生異常',
    status = 1522,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}

class KBOCrawlersError extends ExtendableError {
  constructor(
    message = 'KBO 爬蟲賽前排程錯誤',
    status = 1523,
    isPublic = true,
    code = httpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message, status, isPublic, code);
  }
}
module.exports = {
  UserNotFound,
  UserCouldNotSell,
  MatchNotFound,
  GodUserNotFound,
  GodSellInconsistent,
  GodSellStatusWrong,
  UserNotBelongToGod,
  CouldNotFillInSellInformation,
  CouldNotModifySellInformation,
  OnlyAcceptUserDoesNotBelongsToCertainLeague,
  GodUserDidNotSell,
  CoinOrDividendNotEnough,
  PurchaseTimeShouldBeforeLastMatch,
  CouldNotBuyOwnPredictions,
  UserPredictFailed,
  DeletePredictionsFailed,
  UserPredictSomeFailed,
  MysqlError,
  BetsAPIError,
  PrematchEsoccerError,
  FirebaseCollectError,
  FirebaseRealtimeError,
  AxiosError,
  HandicapEsoccerError,
  PBPEsoccerError,
  PBPNBAError,
  PBPMLBError,
  SettlementAccordingMatch,
  PBPKBOError,
  RepackageError,
  PBPAbnormalError,
  firestoreQueryError,
  PurchasePredictionsModelError,
  UpdateUserCoinAndDividend,
  PropertyMissingError,
  UnknownLeague,
  CreateUserBuysTableRollback,
  UpdateUserCoinORDividendRollback,
  CreateCashflowBuyRollback,
  PredictionHistoryModelError,
  CrawlersError,
  KBOCrawlersError
};
