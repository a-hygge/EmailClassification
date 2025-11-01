import { Router } from "express";
const router = Router();
import authRoutes from "./authRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import emailRoutes from "./emailRoutes.js";
import testRoutes from "./testRoutes.js";
import retrainRoutes from "./retrainRoutes.js";

// Public routes
router.use("/auth", authRoutes);

// Protected routes (cần login)
router.use("/dashboard", dashboardRoutes);
router.use("/emails", emailRoutes);
router.use("/test", testRoutes);
router.use("/retrain", retrainRoutes);

// Home page - redirect
router.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.redirect("/auth/login");
});
export default router;
