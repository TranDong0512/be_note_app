import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();

const SECRET = process.env.SECRET;

if (!SECRET) {
  throw new Error("Missing SECRET in environment variables");
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    console.error("Authorization header is missing");
    return res.status(401).json({
      message: "Người dùng chưa xác thực",
    });
  }

  const accessToken = authorization.split(" ")[1];

  if (!accessToken) {
    console.error("Access token is missing in Authorization header");
    return res.status(401).json({
      message: "Người dùng chưa xác thực",
    });
  }

  jwt.verify(accessToken, SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err);
      return res.status(401).json({
        message: "Token không hợp lệ hoặc đã hết hạn",
      });
    }
    req.decode = decoded as JwtPayload;
    next();
  });
};
