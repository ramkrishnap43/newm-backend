const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { connection } = require("./config/db");
const { UserModel } = require("./models/User.model");

const app = express();
const { authenticate } = require("./Middlewares/authentication");

app.use(express.json());
const router = express.Router()

app.use(
  cors({
    origin: "*",
  })
);

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const userAvailable = await UserModel.findOne({ email });

  if (userAvailable?.email) {
    res.send("Email Already Exists");
  } else {
    try {
      bcrypt.hash(password, 4, async function (err, hash) {
        const user = new UserModel({ email, password: hash });
        await user.save();
        res.send("Your Sign up Successful");
        res.json({ user: user });
      });
    } catch (err) {
      res.send("Something went erong Please try again");
    }
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email }).lean();
  try {
    if (!user) {
      return res.status(400).json({
        msg: "Not Available",
      });
    }

    if (user.length > 0) {
      const makePassword = user[0].password;
      bcrypt.compare(password, makePassword, function (err, result) {
        if (result) {
          const token = jwt.sign(
            {
              userID: user._id,
              email: user.email,
            },

            "hush"
          );
          return res.status(200).json({
            accessToken : token
          })

        } 
        else {
          alert("Invalid Credentials");
          res.send("Invalid Credentials");
        }
      });
    } else {
      alert("Invalid Credentials");
      res.send("Invalid Credentials");
    }
  } catch (err) {
    res.send("Something went Wrong");
  }
});

app.use(authenticate);

app.listen(8080, async () => {
  try {
    await connection;
    console.log("Connected to DB successfully");
  } catch (err) {
    console.log({ err: "Something goes wrong" });
  }
  console.log("Listening on port 8080");
});
