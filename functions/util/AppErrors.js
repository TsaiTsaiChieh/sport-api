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
/* --------------------------- 404 NOT FOUND ---------------------------*/
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

/* --------------------------- 403 FORBIDDEN ---------------------------*/
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
class UserPredictFailed extends ExtendableError {
  constructor(
    message,
    status = 1202,
    isPublic = true,
    code = httpStatus.FORBIDDEN
  ) {
    super(message, status, isPublic, code);
  }
}
module.exports = {
  UserNotFound,
  UserCouldNotSell,
  UserPredictFailed
};
