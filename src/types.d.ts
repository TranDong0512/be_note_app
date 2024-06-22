import { Request } from "express";

declare module "express-serve-static-core" {
  interface Request {
    decode?: string | object | any; // Thay đổi theo kiểu dữ liệu của bạn
  }
}
