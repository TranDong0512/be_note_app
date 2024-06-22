import fs from "fs";
import path from "path";
import { promisify } from "util";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import CounterModel from "../module/countNotes";
dotenv.config();

const SECRET = process.env.SECRET;
const MbSize = 1024 * 1024;
const MAX_IMG_SIZE = 2 * MbSize;

export const setError = (
  res: any,
  message: string,
  code: number = 500
): any => {
  return res.status(code).json({ data: null, code, error: message });
};

export const success = (res: any, message: string, data = null): any => {
  return res.status(200).json({ message, data });
};
export const getMaxID = async (model) => {
  const maxUser =
    (await model.findOne({}, {}, { sort: { _id: -1 } }).lean()) || 0;
  return maxUser._id;
};

export const isImage = async (filePath) => {
  const extname = path.extname(filePath).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".gif", ".bmp"].includes(extname);
};

export const checkImage = async (filePath) => {
  if (typeof filePath !== "string") {
    return false;
  }

  const { size } = await promisify(fs.stat)(filePath);
  if (size > MAX_IMG_SIZE) {
    return false;
  }

  const isImg = await isImage(filePath);
  if (!isImg) {
    return false;
  }

  return true;
};

export const checkEmail = async (email: string): Promise<boolean> => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
};

export const verifyPassword = async (
  inputPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(inputPassword, hashedPassword);
};

// hàm tạo token
export const createToken = async (data, time) => {
  return jwt.sign(data, SECRET, { expiresIn: time });
};
export const createRefreshToken = async (data, time) => {
  return jwt.sign(data, SECRET, { expiresIn: time });
};
// hàm đếm count
export const findCount = async (model, filter) => {
  try {
    const count = await model.countDocuments(filter);
    return count;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getNextCountId = async (model, id) => {
  try {
    const latestFolder = await model.findOne().sort({ id: -1 }).exec();
    if (!latestFolder) {
      return 1;
    }
    const latestId = parseInt(latestFolder.id);
    if (isNaN(latestId)) {
      return "Invalid idFolder value";
    }
    return latestId + 1;
  } catch (error) {
    console.error("Error in getNextCountId:", error);
    throw error;
  }
};

export const getNextNoteId = async () => {
  const counter = await CounterModel.findOneAndUpdate(
    { countNote: "noteId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};
