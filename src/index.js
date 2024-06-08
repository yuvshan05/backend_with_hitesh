// require('dotenv').config({path: '../env'});
import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})

connectDB();

//function connectDB() {}
//connectDB()
//not a better approach better use iife

