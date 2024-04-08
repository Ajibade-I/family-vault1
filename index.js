require("dotenv").config();
require("express-async-errors");
const express = require("express");
const { dbConnect } = require("./lib/dbconnect");
const { errorHandler, notFound } = require("./lib/middleware/error-middleware");
const { userRoutes, fileRoutes } = require("./routes/route-index");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const accesslogs = require("./lib/middleware/accesslogs");
const path = require("path");

const app = express();
const port = process.env.PORT || 4900;

app.use(express.json());
app.use(cookieParser(process.env.PRIVATE_KEY));

app.use(helmet());
app.use(compression({ level: 6, threshold: 0 }));

// Define the route to serve static files (uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/file", accesslogs, fileRoutes);
app.use("/api/user", accesslogs, userRoutes);

app.use(notFound);
app.use(errorHandler);
dbConnect();
app.listen(port, () => console.log(`Server listening on port ${port}....`));
