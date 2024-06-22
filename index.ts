import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import cookieParser from "cookie-parser";
import createError from "http-errors";
import { router } from "./src/router/router";
const AppGhiChu = express();
const PORT = 3001;

const DB_URL = "mongodb://localhost:27017/DB_Ghi_Chu";
mongoose
  .connect(DB_URL)
  .then(() => console.log("DB Connected!"))

  .catch((error) => console.log("DB connection error:", error.message));
function configureApp(app) {
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "jade");
  //   app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
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
}

function errorApp(app) {
  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

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
