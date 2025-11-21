import { Router } from "express";
import {
    showSendEmailPage,
    searchUser,
    sendEmail,
    showGmailForm,
    sendGmail,
    sent,
} from "../controllers/sendEmailController.js";

const router = Router();

router.get("/send", showSendEmailPage);
router.get("/search", searchUser);
router.post("/send", sendEmail);
router.get("/gmail", showGmailForm);
router.post("/gmail", sendGmail);
router.get("/sent", sent);

export default router;