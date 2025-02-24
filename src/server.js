import express from "express";
import { _config } from "./config/config.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import {authenticateUser} from "./middleware/authenticate.js"
import helmet from "helmet";
import logger from "./utils/logger.js";
import morgan from "morgan";
import expressProxy from "express-http-proxy";
import accessLogStream from "./utils/morgan.js";
import errorHandler from "./middleware/errorHandler.js";
import userRoutes from "./routes/userRoute.js";
import adminRoutes from "./routes/adminRoute.js"
import collegeRoutes from "./routes/collgeRoute.js";
import postRoutes from "./routes/postRoute.js";
import followRoutes from "./routes/followRoute.js";
import likeRoutes from "./routes/likeRoute.js";
import commentRoutes from "./routes/commentRoute.js";
import replyRoutes from "./routes/replyRoute.js";

const app = express();


const PORT = _config.PORT;

app.use(cors({
origin: "http://localhost:3001",
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(helmet());
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
  stream: accessLogStream
}));


//health check
app.get("/health", (req, res) => {
    res.status(200).send("OK");
});


//proxy
app.use("/api/v1/message", authenticateUser,expressProxy("http://localhost:3002"))

//routes

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin" ,adminRoutes)
app.use("/api/v1/college", collegeRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/follow", followRoutes);
app.use("/api/v1/comment", commentRoutes);
app.use("/api/v1/reply", replyRoutes);

app.use(errorHandler);
app.listen(_config.PORT, () => {
  logger.info(`User service is running on port ${PORT}`);
  logger.info(`Database is running on port ${_config.DATABASE_URI}`);

});


//unhandle rejection
process.on("unhandledRejection", (reason, promise) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    throw reason;
  });

export default app;