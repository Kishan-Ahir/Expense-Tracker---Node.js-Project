const express = require("express");
const app = express();
const path = require("path");
const bodyparser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const sequelize = new Sequelize("expenses","root","Chandravadiya@2003",{
    host: "localhost",
    dialect: "mysql"
});

const User = sequelize.define("user",{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement : true,
        allowNull : false,
        primaryKey: true
    },
    name : {
        type : Sequelize.STRING,
        allowNull : false
    },
    email : {
        type : Sequelize.STRING,
        allowNull : false
    },
    password : {
        type : Sequelize.STRING,
        allowNull : false
    }
});

app.use(cors());

app.use(bodyparser.json());


app.post("/user/signup",async (req,res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    let userexist;
    await User.findAll({where: {email:email}})
    .then(async (user)=>{
        if(user[0])
        {
            userexist = true;
            res.json(userexist)
            
        } else {
            await User.create({
                name:name,
                email:email,
                password:password
            }).then(()=>{
                userexist = false;
                return res.json(userexist);
            })
        }
    })
})

app.get("/",(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,"Signup Screen Frontend.html"));
})

User.sync()
.then(()=>{
    console.log("Server is starting...");
    app.listen(3000);
})