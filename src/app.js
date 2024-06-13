import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials:true
    }
))

app.use(express.json({limit:"16Kb"}))
app.use(express.urlencoded({extended:true , limit:"16Kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import 
import userRouter from './routes/user.routes.js'

//routes declaration
//dekho pehle backend mein simply app.get krte the and routes de dete the lekin ab hum routes alag define kiye hai to humlog ko middleware ka istemal karna padega jo ki use krega app.use 


app.use("/api/v1/users" , userRouter)


//ab is link se ye pass ho jayega user.routes.js pe and wahan jo patha hoga usse wo connect ho jayega ab jo iska path hai wo hai aur ye api version(v1) likhna padta hai achhi practice hai
//https://localhost:8080/api/v1/users/register 


export {app}