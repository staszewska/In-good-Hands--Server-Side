/* Configuring Passport Strategies 
Two Passport strategies are defined.
The first one, "LocalStrategy" defines basic HTTP authentication for login request.
The second one, "JWTStrategy" allows to authenticate users based on the JWT submitted alongside their request.
*/

const passport = require("passport");
(LocalStrategy = require("passport-local").Strategy),
  (Models = require("./models")),
  (passportJWT = require("passport-jwt"));

let Users = Models.User,
  JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: "Email",
      passwordField: "Password",
    },
    async (email, password, callback) => {
      try {
        // Find the user by email
        const user = await Users.findOne({ Email: email });

        // Check if user exists
        if (!user) {
          console.log("Incorrect email");
          return callback(null, false, {
            message: "Incorrect email or password",
          });
        }

        console.log("User found, finished");
        return callback(null, user);
      } catch (error) {
        // Catch and handle any errors
        console.log(error);
        return callback(error);
      }
    }
  )
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: "your_jwt_secret",
    },
    async (jwtPayload, callback) => {
      return await Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
