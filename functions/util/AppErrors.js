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
    message = '使用者狀態異常',
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
module.exports = {
  UserNotFound,
  UserCouldNotSell,
  MatchNotFound,
  GodSellInconsistent,
  GodSellStatusWrong,
  UserPredictFailed,
  MysqlError,
  BetsAPIError
};
