import router from "express";
import { auth } from "../../middelware/auth";
import {
  addFolder,
  deleteFolder,
  listFolder,
} from "../../controller/folderController";

export const routerFolder = router();
routerFolder.post("/", auth, addFolder);
routerFolder.get("/", auth, listFolder);
routerFolder.delete("/", auth, deleteFolder);
