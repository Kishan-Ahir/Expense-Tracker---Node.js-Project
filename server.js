const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");

const sequelize = new Sequelize("expenses", "root", "Chandravadiya@2003", {
  host: "localhost",
  dialect: "mysql"
});

// Define User model
const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

// Middleware
app.use(cors());
app.use(bodyparser.json());
app.use(express.static(path.join(__dirname, "public")));

// Sign up route
app.post("/user/signup", async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let userExists = false;

    function isStringNotValid(string) {
      if (string.length !== 0) return false;
      else return true;
    }

    if (
      isStringNotValid(name) ||
      isStringNotValid(email) ||
      isStringNotValid(password)
    ) {
      if (isStringNotValid(name))
        return res.status(500).json("enter correct name");
      if (isStringNotValid(email))
        return res.status(500).json("enter correct email");
      if (isStringNotValid(password))
        return res.status(500).json("enter correct password");
    }

    await User.findAll({ where: { email: email } }).then(async (users) => {
      if (users[0]) {
        userExists = true;
        return res.status(400).json(userExists);
      }
      bcrypt.hash(password,10,async(err,hash)=>{
        await User.create({
            name: name,
            email: email,
            password: hash
          }).then(() => {
            return res.status(201).redirect("/");
          });
        });
      })
  } catch (err) {
    res.status(500).json("server error");
  }
});

// Login page route
app.get("/user/login", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "Login Screen Frontend.html"));
});

// Login check route
app.post("/user/logincheck", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const users = await User.findAll({ where: { email: email } });
    if(users[0])
    {
        bcrypt.compare(password,users[0].password,(err,result)=>{
            if(err)
            {
                return res.status(404).json(err);
            }
            if(result == true)
            {
                return res.status(200).json("Login Successfully.");
            } else if(result == false)
            {
                return res.status(403).json("Please enter correct password");
            }
        })
    } else return res.status(404).json("User not found");
  } catch (err) {
    return res.status(404).json(err);
  }
});

// Home page route
app.get("/", (req, res) => {
  res.status(200).sendFile(path.join(__dirname, "Signup Screen Frontend.html"));
});

// Sync User model and start server
User.sync().then(() => {
  console.log("Server is starting...");
  app.listen(3000);
});