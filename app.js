//jshint esversion:6

//NPM PACKETS VI ØNSKER Å BRUKE SOM STORES I KONSTANTE VARIABLER
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const res = require("express/lib/response")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")


const app = express() // SETTER OPP EXPRESS SLIK AT VI KAN BRUKE METODER SOM USE,SET,POST,GET OG LISTEN

app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({
    extended:true // OFTE NÅR NOE ER SKREVET SLIKT ER DET FOR Å FORMATERE UTKOMMET PÅ EN ANNET MÅTE, OFTE GRUNNET DEPRIKASJON
}))


app.use(session({
    secret:"hemmelighet",
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/loginsDB", {useNewUrlParser: true}) // HER KOBLER VI OSS TIL DATABASEN VI ØNSKER Å BRUKE

// MAL PÅ HVORDAN DATA SKAL SAMLES INN I MONGODB
const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

// BRUKER PASSPORT.JS SOM GJØR MYE ARBEID FOR OSS
userSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User",userSchema)

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const user = new User ({
    email: "john.appleseed@gmail.com",
    password: "Password123"
})



// APP.GETS - SENDER EN BRUKER FILER BASERT PÅ HVA SOM STÅR I SØKEFELTET
app.get("/",(req,res)=>{
    res.render("home")
})

app.get("/login",(req,res)=>{
    res.render("login")
})

app.get("/secrets",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
    
})

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/logout",(req,res)=>{
    res.logout()
    res.redirect("/")
})

// APP POSTS - BEHANDLER SUBMITS FRA FORMS OG KAN HENTE DATA UT FRA DEM
app.post("/register", (req,res)=>{

    User.register({username: req.body.username},req.body.password,(err,user)=>{
        if(err){
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/secrets")
            })
        }
    })

})

app.post("/login",(req,res)=>{

    const user = new User({
        username:req.body.username,
        password:req.body.password
    })

    req.login(user,(err)=>{
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req,res,()=>{
                res.redirect("/secrets")
            })
        }
    })
})


// APP LISTEN
app.listen("3000",()=>{
    console.log("server started on 3000");
})