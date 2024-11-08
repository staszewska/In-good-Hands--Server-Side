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
      emailField: "Email",
      passwordField: "Password",
    },
    async (email, password, callback) => {
      console.log(`${email} ${password}`);
      await Users.findOne({ Email: email });
    }
  )
    .then((user) => {
      if (!user) {
        console.log("Incorrect email");
        return callback(null, false, {
          message: "Incorrect email or password",
        });
      }
      console.log("finished");
      return callback(null, user);
    })
    .catch((error) => {
      if (error) {
        console.log(error);
        return callback(error);
      }
    })
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
