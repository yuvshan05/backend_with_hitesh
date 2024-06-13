// require('dotenv').config({path: '../env'});
import dotenv from "dotenv"
import connectDB from "./db/index.js";
// import express from 'express';
import { app } from "./app.js";
// const app = express();
dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=> {
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!! ",err);
})

//function connectDB() {}
//connectDB()
//not a better approach better use iife

