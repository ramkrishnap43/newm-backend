const express = require("express")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")
const cors = require("cors");

const {connection} = require("./config/db");
const { UserModel } = require("./models/User.model");

const {authenticate} = require("./Middlewares/authentication");
const e = require("express");


const app = express();


app.use(express.json())

app.use(cors({
    origin : "*"
}))


app.post("/signup" , async(req,res) => {

    const {email, password} = req.body;
    const userAvailable = await UserModel.findOne({email})

    if(userAvailable ?. email){
        res.send("Email Already Exists")
    }
    else{
        try{
            bcrypt.hash(password, 4 , async function(err,hash){
                const user = new UserModel({email, password})
                await user.save()
                res.send("Your Sign up Successful")
            })
        }
        catch(err){
            res.send("Something went erong Please try again")
        }
    }

})



app.post("/login" , async(req,res) => {
    const {email, password} = req.body;

    try{
        const user = await UserModel.find({email})
        if(user.length > 0){
            const makePassword = user[0].password;
            bcrypt.compare(password , makePassword , function(err, result){

                if(result){
                    const token = jwt.sign({"userID" : user[0]._id}, "hush")
                   alert("Login Successful")
                    res.send({"MSG" : "Login Successful", "token" : token})
                }
                else{
                    alert("Invalid Credentials")
                    res.send("Invalid Credentials")
                }
            })
        }
        else{
            alert("Invalid Credentials");
            res.send("Invalid Credentials")
        }

    }
    catch(err){
        res.send("Something went Wrong")
    }
})

app.use(authenticate)

app.listen(8080 , async() => {
    try{
        await connection
        console.log("Connected to DB successfully")
    }
    catch(err){
        console.log({"err" : "Something goes wrong"})
    }
    console.log("Listening on port 8080")
})





