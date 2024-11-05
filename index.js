const express = require("express");
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

const mongoose = require("mongoose");
const Models = require("./models");

const Users = Models.User;
mongoose
  .connect("mongodb://localhost:27017/inGoodHands", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error(error));

// Register new user

app.post("/users", async (req, res) => {
  console.log("Request received for user creation");

  console.log(req.body);

  await Users.findOne({ Email: req.body.Email })
    .then((user) => {
      if (user) {
        // If user already exists
        console.log("User already exists");
        return res.status(400).send(req.body.Email + " already exists");
      } else {
        // If user does not exists, proceed to create
        console.log("Create new user");
        return Users.create({
          Email: req.body.Email,
          Password: req.body.Password,
        });
      }
    })
    .then((user) => {
      if (user) {
        console.log("User created");
        console.log("Creating new user");
        res.status(200).json(user);
      }
    })
    .catch((error) => {
      console.log("Error during creation");
      res.status(500).send("Error: " + error);
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
