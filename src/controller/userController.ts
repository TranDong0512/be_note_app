import { Request, Response } from "express";
import { User } from "../module/user";
import { RefreshToken } from "../module/refreshToken";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  checkEmail,
  createRefreshToken,
  createToken,
  getNextCountId,
  setError,
  success,
  verifyPassword,
} from "../service/function";

export const register = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    let { email, password, userName } = req.body;
    let userFind = await User.findOne({ email });

    if (userFind) {
      return setError(res, "Email đã tồn tại", 400);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Tính toán userId tự động tăng
      const userId = await getNextCountId(User);
      const user = new User({
        email,
        password: hashedPassword,
        userName,
        userId,
      });
      await user.save();
      const userResponse = {
        email,
        userName,
      };
      return success(res, "Đăng ký thành công", userResponse);
    }
  } catch (error) {
    return setError(error, "Đã có lỗi xảy ra");
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    let { email, password } = req.body;
    let isEmailValid = await checkEmail(email);
    if (isEmailValid) {
      let user = await User.findOne({ email: email });
      if (!user) {
        return setError(res, "Không tìm thấy tài khoản người dùng", 404);
      }
      let checkPassWord = await verifyPassword(
        password,
        user.password as string
      );
      if (!checkPassWord) {
        return setError(res, "Mật khẩu không chính xác", 401);
      }
      let login = {
        userEmail: email,
        userName: user.userName,
        userId: user.userId,
        type: 1,
      };
      // Lưu refreshToken vào cookie và databasse
      const refreshToken = await createRefreshToken(login, "1d");
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });

      const refreshTokenDocument = new RefreshToken({
        userId: user.userId,
        refToken: refreshToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
      await refreshTokenDocument.save();

      // Tạo token và trả về cho cline
      const token = await createToken(login, "300s");
      return success(res, "Đăng nhập thành công", {
        token,
        info: login,
      });
    }
  } catch (error) {
    return setError(error, "Đã có lỗi xảy ra");
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshTokenFromCookie = req.cookies.refreshToken;

    if (!refreshTokenFromCookie) {
      return setError(res, "Bạn chưa xác thực đăng nhập", 401);
    }

    const existingToken = await RefreshToken.findOne({
      token: refreshTokenFromCookie,
    });
    if (!existingToken) {
      return setError(res, "Refresh token không hợp lệ", 403);
    }
    jwt.verify(
      refreshTokenFromCookie,
      process.env.SECRET,
      async (err, user) => {
        if (err) {
          return setError(res, "Refresh token không hợp lệ", 403);
        }
        const { userEmail, userName, userId, type } = user;
        try {
          const newAccessToken = await createToken(
            { userEmail, userName, userId, type },
            "300s"
          );
          const newRefreshToken = await createRefreshToken(
            { userEmail, userName, userId, type },
            "1d"
          );

          res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: false, // Đặt thành true nếu bạn sử dụng HTTPS
            path: "/",
            sameSite: "strict",
          });

          if (newRefreshToken) {
            const newRefreshTokenDocument = new RefreshToken({
              userId: existingToken.userId,
              refToken: newRefreshToken,
              expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });

            await newRefreshTokenDocument.save();

            // Xóa refresh token cũ trong DB
            await RefreshToken.deleteOne({ _id: existingToken._id });
          }
          return success(res, "Refresh thành công", { newAccessToken });
        } catch (tokenError) {
          console.error("Token creation error:", tokenError);
          return setError(res, "Đã có lỗi xảy ra khi tạo token", 500);
        }
      }
    );
  } catch (error) {
    console.error("General error:", error);
    return setError(res, "Đã có lỗi xảy ra", 500);
  }
};
export const logout = async (req: Request, res: Response) => {
  try {
    const refToken = req.cookies.refreshToken;

    if (!refToken) {
      return setError(res, "Không tìm thấy token trong cookies", 404);
    }
    res.clearCookie("refreshToken");
    await RefreshToken.findOneAndDelete({ refToken });
    return success(res, "Đăng xuất thành công");
  } catch (error) {
    return setError(res, "Đã có lỗi xảy ra", 500);
  }
};
