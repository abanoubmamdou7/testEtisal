import { Router } from "express";
import * as authController from "./controller/auth.controller.js";

const router = Router();
//login
router.post("/login",authController.login )

export default router;
