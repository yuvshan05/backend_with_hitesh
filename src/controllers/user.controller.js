//step 1: user details jo hai wo mainly req.body se aati hai agar body se aa rahi hai kabhi kabhi url se v details aati hai
//ab dekho file handling v karni padegi so multer as a middleware ka bahut need hai so jo routes hai user.routes.js wahan ye registerUser se pehle multer laga denge and .fields ka istemal karenge
//step 2 validation jo ki tum if(username===""){throw new apiError(400,"username is missing  ")} ab dekh isme sab hi field ka likhna padega so humlog jo neeche likhe hai wo advace tareeka hai (isme trim karte hai and phir v empty hai to condition true) baaki condition v tum check kar skte ho isi tarah jese ki email mein @symbol hai ya nahi
//step 3 isme check karna hai ki use already registered hai ya nahi is case mein humlog user import karenge model se jo direct contact kar skta hai mongodb se
//step 4 ab check karna hai ki sala images and avatar upload hua hai ki nahi jese ki pehle bataya line 2 mein ki middleware inject ho gya hai so uski madat se .files kar ke v dekkh skte hai jo pehle express se karte the req.body se ab req.files se karenge and check karenge for file path kyunki multer mein wahi likhe hai humlog
//step 5 to upload we already have cloudinary files in utils so we will import that
//step 6 to create user in db we will just use create syntax
//step 7 to remove the user we will check ki we have that user or not by _id that mongodb give to all the entry by default and we will remove that by using select syntax is weird go to line 62 for reference

import { asyncHandler } from "../utils/assyncHandler.js";
import { apiError } from "../utils/apiError.js";
import {User} from "../models/users.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async(userId)=>{
   try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      //ab ye generated token ko user ke refresh token mein v save krna hai 
      user.refreshToken=refreshToken;
      await user.save({validateBeforeSave: false})
      //isse ye database mei update ho jayega but password se varify karna padta thats why validation off kr diye

      return {accessToken , refreshToken}

   } catch (error) {
      throw new apiError(500 , "Something went wrong while refresh and access token")
   }
}

const registerUser = asyncHandler(async(req , res)=>{
   //get user details from frontend
   //validation - not empty(kya pata wrong na ho)
   //check if user is already registered:username , email
   // check for images , check for avatar
   //upload them to cloudinary , avatar
   //create user object - create entry in db
   //remove password and refresh token field from response
   //check for user creation
   //return response 
   const {fullname , email , username , password} = req.body
   //console.log("email: ",email);

   if (
      [fullname, email, username, password].some((field)=>field?.trim() === "")
   ) {
      throw new apiError(400 , "all Fields are required")
   } 

   const existedUser =await User.findOne({
      $or : [{ username } , { email }]
   })
   if (existedUser) {
      throw new apiError(409 , "User with email or with username already exists")
   }
   //console.log(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path;
   //const coverImageLocalPath = req.files?.coverImage[0]?.path;
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   if (!avatarLocalPath) {
      throw new apiError(400 , "Avatar file is required urgently")      
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath)
   const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new apiError(400 , "Avatar file is required .")    
   }

   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username:username.toLowerCase(),
   })
   const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
   )
   if(!createdUser){
      throw new apiError(500 , "Something went wrong while registering the user ")
   }
   
   return res.status(201).json(
      new apiResponse(200, createdUser , "User registered successfully ")
   )

})

const loginUser = asyncHandler(async (req , res)=>{
   /*1) login details i.e req body -> data
   2) username or email mein se kisi ek se validate karo
   3) password check
   4) access and refresh token generate
   5) send this token in form of cookie
   6) send res */

   const {email , username , password} = req.body

   if(!(username || email)){
      throw new apiError(400 , "username or email is required")
   }

   const user = await User.findOne({
      $or: [{username} , {email}]
   })
   if(!user){
      throw new apiError(400 , "user does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)
   if(!isPasswordValid){
      throw new apiError(401 , "invalid user credentials")
   }
   const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   //sending cookies
   //http only and secure true karne se ye front end se phir modify nahi hogi jo hame chahiye sirf ye server se hi hogi

   const options = {
      httpOnly : true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken ",accessToken , options)
   .cookie("refreshToken ",refreshToken , options)
   .json(
      new apiResponse(
         200,
         {
            user:loggedInUser , accessToken , refreshToken
         },
         "User Logged In Successfully"
      )
   )
}) 

const logoutUser = asyncHandler(async (req , res)=> {
   //clear cookies and refresh token from db after finding that user
   //humlog isliye auth middleware add kiye hain taaki token aa paye
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken: undefined
         }
      },
      {
         new: true
      }
   )

   const options = {
      httpOnly : true,
      secure: true
   }

   return res
   .status(200)
   .clearCookie("accessToken" , options)
   .clearCookie("refreshToken" , options)
   .json(new apiResponse(200, {} , "User logged out"))
})

//refreshtoken se new access token generate kar rehe hain
const refreshAccessToken = asyncHandler(async (req , res)=>{
   //user ke pass jo refresh token hai wo le lenge agar pc pe hai to cookie se le lenge and agar mobile hai to body se 
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if(!incomingRefreshToken){
      throw new apiError(401 , "unautorised request")
   }

   //ab verify karenge token ko kyunki jo user ke pass pahuchta hai wo encrypted form mein pahuchta hai and usko verify jwt se krte hai 
   try {
      const decodedToken = jwt.verify(
         incomingRefreshToken , 
         process.env.REFRESH_TOKEN_SECRET
      )
      const user = await User.findById(decodedToken?._id)
      if(!user){
         throw new apiError(401 , "Invalid refresh token")
      }
      if (incomingRefreshToken!==user?.refreshToken) {
         throw new apiError(401 , "Refresh token is expired or used")
      }
      const options={
         httpOnly: true,
         secure: true
      }
   
      const {accessToken , newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
       
      return res
      .status(200)
      .cookie("accessToken" , accessToken , options)
      .cookie("refreshToken" , newRefreshToken , options)
      .json(
         new apiResponse(
            200,
            {accessToken , refreshToken: newRefreshToken},
            "Access token refreshed"
         )
      )
   } catch (error) {
      throw new apiError(401 , error?.message || "Invalid refresh token" ) 
   }
})

export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken
}