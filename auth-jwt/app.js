require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const publicRoutes = require("./routes/public");
const privateRoutes = require("./routes/private");

const PORT = 3000;
const DATABASE_CREDENTIALS = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};
const DATABASE_CONNECTION_STRING = `mongodb+srv://${DATABASE_CREDENTIALS.user}:${DATABASE_CREDENTIALS.password}@cluster0.hvczgn3.mongodb.net/?retryWrites=true&w=majority`;

const app = express();

app.use(express.json());

app.use("", publicRoutes);
app.use("/auth", privateRoutes);

mongoose
  .connect(DATABASE_CONNECTION_STRING)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log(error));
