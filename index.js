import express from "express";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import flash from "connect-flash";
import env from "dotenv";
import channelRoutes from "./routes/channelRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import { getUserByEmail, verifyPassword } from "./models/userModel.js";

const app = express();
const port = process.env.PORT || 3000;
env.config();

// Initialize Cookies and Sessions middlewares
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Other middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Middlewares for global data
app.use((req, res, next) => {
  if (req.user) {
    // if user is logged in
    res.locals.user = req.user;
  } else {
    // if user is logged out
    res.locals.user = null;
  }
  next();
});

app.use(flash());

app.use((req, res, next) => {
  res.locals.errorMessage = req.flash("error");
  next();
});

// Setup for all routes
app.use("/", channelRoutes);

app.use("/", authRoutes);

app.use("/", postRoutes);

// Passport стратегия за автентикация
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const user = await getUserByEmail(username);

      if (!user) {
        return cb(null, false, { message: "Имейлът не съществува." });
      }

      const isPasswordCorrect = await verifyPassword(password, user.password);

      if (!isPasswordCorrect) {
        return cb(null, false, { message: "Грешна парола." });
      }

      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  })
);

// Сериализация и десериализация на потребител
passport.serializeUser((user, cb) => {
  return cb(null, user);
});

passport.deserializeUser((user, cb) => {
  return cb(null, user);
});

app.listen(port, () => {
  console.log(`Listening on port http://localhost:${port}...`);
});
