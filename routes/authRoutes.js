import express from "express";
import UserController from "../controllers/authController.js";
import passport from "passport";
import { uploadFiles } from "../config/multer.js";
import multer from "multer";

const router = express.Router();

router.get("/login", UserController.getLoginPage);
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/login/google", passport.authenticate("google"));
router.get(
  "/auth/google",
  passport.authenticate("google", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

router.get("/register", UserController.getRegisterPage);
router.post("/register", UserController.registerController);

router.get("/account/:userId", UserController.getAccountPage);

router.get("/edit-profile", UserController.getEditProfilePage);
router.post("/edit-profile", UserController.updateController);
router.post("/change-password", UserController.changePasswordController);
router.get("/change-profile-picture", UserController.getChangeProfilePicturePage);
router.post("/change-profile-picture", (req, res, next) => {
    uploadFiles(req, res, (err) => {
      if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).render("change-profile-picture", {
          errorMessage: "Файлът е твърде голям. Максимум 5MB.",
        });
      }
      next();
    });
  },
  UserController.changeProfilePictureController
);
router.delete("/delete-profile-picture", UserController.deleteProfilePictureController);

router.get("/logout", UserController.logoutController);

export default router;
