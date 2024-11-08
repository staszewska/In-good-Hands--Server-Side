const passport = require("passport");
require("./passport");

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

// Allow user to log in

const jwtSecret = "your_jwt_secret";

const jwt = require("jsonwebtoken"),
  passport = require("passport");

require("./passport");

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Email, // This is the email you’re encoding in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

/* POST login. */
module.exports = (router) => {
  router.post("/login", (req, res) => {
    //function from passport that authenticates a user.
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
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
};
