import express from "express";
import {
  getLoginPage,
  getRegisterPage,
  registerUser,
  logoutUser,
  getEditProfilePage,
  updateProfile,
  changePassword,
  getAccount
} from "../controllers/authController.js";
import passport from "passport";

const router = express.Router();

router.get("/login", getLoginPage);

router.get("/register", getRegisterPage);

router.get("/account/:user_id", getAccount);

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.post("/register", registerUser);

router.get("/edit-profile", getEditProfilePage)
router.post("/edit-profile", updateProfile)
router.post("/change-password", changePassword);

// Remove user's session
router.get("/logout", logoutUser);

export default router;
