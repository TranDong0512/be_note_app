import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { router } from "./src/router/router";
import jwt from "jsonwebtoken";
import { morganLogger, errorLogger, logger } from "./logger";

const SECRET = process.env.SECRET;
const AppGhiChu = express();
const PORT = 3001;

const DB_URL = "mongodb://localhost:27017/DB_Ghi_Chu";
mongoose
  .connect(DB_URL)
  .then(() => console.log("DB Connected!"))

  .catch((error) => console.log("DB connection error:", error.message));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
});
function configureApp(app) {
  app.use(helmet());
  app.set("view engine", "jade");
  //   app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(limiter);
  // app.use(express.static("../storage"));
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    })
  );

  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });

  app.use(async (req: express.Request & { user?: any }, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (token) {
        const decoded = jwt.verify(token, "YOUR_SECRET_KEY") as {
          email: string;
        };
        req.user = { email: decoded.email };
      } else {
        req.user = {
          email: req.body.email || "anonymous",
        };
      }
      next();
    } catch (error) {
      console.error("Failed to retrieve user information", error);
      next();
    }
  });
  app.use(morganLogger);
}

function errorApp(app) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });
  app.use(errorLogger);

  // error handler
  app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
  });
}

configureApp(AppGhiChu);

AppGhiChu.use("", router);

errorApp(AppGhiChu);
AppGhiChu.listen(PORT, () => {
  console.log("App running on port: " + PORT);
});
