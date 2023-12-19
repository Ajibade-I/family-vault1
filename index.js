require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const { errorHandler, notFound } = require("./lib/middleware/error-middleware");
const { imageRoutes, userRoutes } = require("./routes/route-index");
const cookieParser = require("cookie-parser");

const app = express();
const port = process.env.PORT || 4900;
app.use(express.json());
app.use(cookieParser(process.env.PRIVATE_KEY));

app.use("/api/image", imageRoutes);
app.use("/api/user", userRoutes);

app.use(notFound);
app.use(errorHandler);
dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
