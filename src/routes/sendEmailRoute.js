import { Router } from "express";
import {
    showSendEmailPage,
    searchUser,
    sendEmail,
    sent,
} from "../controllers/sendEmailController.js";

const router = Router();

// Không cần middleware, session tự kiểm tra trong controller
router.get("/send", showSendEmailPage);
router.get("/search", searchUser);
router.post("/send", sendEmail);
router.get("/sent", sent);

export default router;