const CustomApiError = require("./custom-api-error");
const { StatusCodes } = require("http-status-codes");

class UnauthorizedError extends CustomApiError {
  constructor(message) {
    super(message);
    this.statusCode = StatusCodes.FORBIDDEN;
  }
}
module.exports = UnauthorizedError;
