import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({limit: "16kb"}));
app.use(express.urlencoded({extended: true, limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());

app.get ("/",(req,res)=>{
    res.send("server is running!");

});


// routes import
import userRouter from './routes/user.routes.js';
import postRouter from './routes/post.routes.js';

app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);

export { app };