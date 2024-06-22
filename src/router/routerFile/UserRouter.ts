import router from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../../controller/userController";

export const routerUser = router();
routerUser.post("/login", login);
routerUser.post("/register", register);
routerUser.post("/refresh", refreshToken);
routerUser.post("/logout", logout);
