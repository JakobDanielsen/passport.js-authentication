//jshint esversion:6
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const res = require("express/lib/response")

mongoose.connect("mongodb://localhost:27017/loginsDB", {useNewUrlParser: true})
const infoSchema = new mongoose.Schema({
    email: String,
    password: String
})

const User = mongoose.model("User",infoSchema)

const user = new User ({
    email: "john.appleseed@gmail.com",
    password: "Password123"
})

// user.save()


const app = express()

app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({
    extended:true
}))

// APP.GETS (
app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/register",(req,res)=>{
    res.render("register")
})
// APP.GETS )

app.post("/register", (req,res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    newUser.save((err)=>{
        if(err){
            console.log(err);
        } else {
            res.render("secrets")
        }
    })
})

app.post("/login",(req,res)=>{
    const username = req.body.username
    const password = req.body.password

    User.findOne({email:username},(err,foundUser)=>{
        if(err){
            console.log(err);
        } else {
            if(foundUser){
                if(foundUser.password === password) {
                    res.render("secrets")
                }
            }
        }
    })
})

app.listen("3000",()=>{
    console.log("server started on 3000");
})