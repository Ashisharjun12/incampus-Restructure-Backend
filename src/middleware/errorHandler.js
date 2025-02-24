
import logger from "../utils/logger.js";

const errorHandler = (error, req, res, next) => {
  logger.error(error.stack);
  res
    .status(error.status || 500)
    .json({ message: error.message || "Internal Server Error" });
};

export default errorHandler;