import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

const app = express();

//middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "17kb" }));
app.use(express.urlencoded({ extended: true, limit: "17kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// custom routes
import healthCheckRouter from "./routes/healthCheck.routes.js";
import authCheckRouter from "./routes/auth.routes.js";
import categoryRouter from "./routes/category.routes.js";
import postRouter from "./routes/post.routes.js";

app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/users", authCheckRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/posts", postRouter);

export default app;
