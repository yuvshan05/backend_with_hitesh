import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/assyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model.js";
//ya to cookies ke pass accesstoken hoga ya to header jo hota hai jwt ka usme authorization: bearer <token> likha jata hai isliye humlog authorization ko khoje and humlog ko sirf token chahiye tha to bearer ko "" se explain kr diye

export const verifyJWT = asyncHandler(async(req , _ , next)=>{
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
        if(!token){
            throw new apiError(401 , "Unauthorized request")
        }
    
        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new apiError(401 , "invalid access token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new apiError(401 , error?.message || "Invalid access token")
    }
})