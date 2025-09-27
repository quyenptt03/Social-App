import { config } from "dotenv";
import "express-async-errors";

//express
import express from "express";

// others packages
import cors from "cors";
import morgan from "morgan";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

//database
import connectDB from "./db/connect";

// routes
import { authRouter, userRouter, postRouter, commentRouter } from "./routers";

//middlewares
import errorHandlerMiddleware from "./middleware/error-handler";

// config env
config();

const app = express();

const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(cookieParser(process.env.JWT_SECRET));

// Configure CORS to allow all origins
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    maxAge: 86400, // Cache preflight response for 24 hours
  })
);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/users", userRouter);

app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.DB_URI);
    app.listen(port, () => {
      console.log(`Server is listening at port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();

export default app;
