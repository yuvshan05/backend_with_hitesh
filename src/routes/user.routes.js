import { Router } from "express";
import { 
    changeCurrentPassword,
    getCurrentUser, 
    getUserChannelProfile, 
    getWatchHistory, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    registerUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage 
} from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
//import { verify } from "jsonwebtoken";


const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)

router.route("/login").post(loginUser)

//secured routes
//verify jwt to know whether use is login or not
router.route("/logout").post(verifyJWT , logoutUser )
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT , changeCurrentPassword)
router.route("/current-user").get(verifyJWT , getCurrentUser)
//.patch se selected hi update hoga warna sb ho jayega post se 
router.route("/update-account").patch(verifyJWT , updateAccountDetails)
router.route("/avatar").patch(verifyJWT , upload.single("avatar"),updateUserAvatar)
//avatar.single("avatar")ka matlab hai single file hi upload hogi and uska naam avatar hoga
router.route("cover-image").patch(verifyJWT , upload.single("/coverImage"),updateUserCoverImage)

//jab params se lena hai data to iss form mein lo and : ke baad wahi likhna jisme expect kr rehe ho
router.route("/c/:username").get(verifyJWT , getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

export default router;