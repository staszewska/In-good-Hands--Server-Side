const passport = require("passport");
require("./passport");
const bcrypt = require("bcrypt");
const cors = require("cors");

const express = require("express");
const app = express();
const port = 8000;

// Use CORS middleware
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const mongoose = require("mongoose");
const Models = require("./models");

const Users = Models.User;

//Connect to MongoDB
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

  try {
    const existingUser = await Users.findOne({ Email: req.body.Email });

    if (existingUser) {
      console.log("User already exists");
      return res.status(400).json({
        Message: req.body.Email + " is already existing",
      });
    } else {
      // If user does not exists, proceed to create
      console.log("Create new user");
    }

    const hashedPassword = await bcrypt.hash(req.body.Password, 10);
    console.log(hashedPassword);

    const newUser = await Users.create({
      Email: req.body.Email,
      Password: hashedPassword,
    });

    console.log("User created");
    return res.status(201).json({
      Message: "User created",
    });
  } catch (error) {
    console.log("Error during creation");
    res.status(500).send("Error: " + error);
  }
});

// Allow user to log in

const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken");

// Helper function to generate JWT token
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Email, // This is the email you’re encoding in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
app.post("/login", (req, res) => {
  //function from passport that authenticates a user
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      console.log("User not found");
      return res.status(400).json({
        message: "User not found",
        user: user,
      });
    }

    //function that "logs in" the user by attaching the user's data to the request object
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }
      let token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    });
  })(req, res);
});

// Start server

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
