import morgan from "morgan";
import winston from "winston";
import fs from "fs";
import path from "path";
import { format } from "date-fns";

// Tạo thư mục log nếu chưa tồn tại
const logDirectory = path.join(process.cwd(), "morgan_log");
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// Cấu hình Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
    )
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDirectory, "combined.log"),
    }),
    new winston.transports.File({
      filename: path.join(logDirectory, "errors.log"),
      level: "error",
    }),
  ],
});

// Middleware Morgan tùy chỉnh để ghi log vào file của từng người dùng
const morganLogger = morgan((tokens, req: any, res) => {
  const logDetails = {
    email: req.user?.email || "anonymous",
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    responseTime: `${tokens["response-time"](req, res)} ms`,
  };

  logger.info(JSON.stringify(logDetails));
  return null;
});

// Middleware ghi log lỗi với Winston
const errorLogger = (err, req, res, next) => {
  const errorDetails = {
    email: req.user?.email || "anonymous",
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
  };

  logger.error(JSON.stringify(errorDetails));
  next(err);
};

export { morganLogger, errorLogger, logger };
