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
const env = require("dotenv")
env.config()

const app = express() // SETTER OPP EXPRESS SLIK AT VI KAN BRUKE METODER SOM USE,SET,POST,GET OG LISTEN

app.use(express.static("public"))
app.set("view engine","ejs")
app.use(bodyParser.urlencoded({
    extended:true // OFTE NÅR NOE ER SKREVET SLIKT ER DET FOR Å FORMATERE UTKOMMET PÅ EN ANNET MÅTE, OFTE GRUNNET DEPRIKASJON
}))


app.use(session({
    secret:process.env.SESSION_SECRET,
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

// BRUKER PASSPORT.JS MED MONGOOSE SOM GJØR MYE ARBEID FOR OSS
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

app.get("/docs",(req,res)=>{
    if(req.isAuthenticated()){
        res.render("docs")
    } else {
        res.redirect("/login")
    }
    
})

app.get("/register",(req,res)=>{
    res.render("register")
})

app.get("/logout",(req,res)=>{
    req.logout() // DETTE SKJER ETTER NOEN TRYKKER PÅ LOG OUT, .LOGOUT ER EN METODE FRA PASSPORT.JS
    res.redirect("/")
})

app.get("/failed",(req,res)=>{
    res.render("failed")
})



// APP POSTS - BEHANDLER SUBMITS FRA FORMS OG KAN HENTE DATA UT FRA DEM
app.post("/register", (req,res)=>{

    User.register({username: req.body.username},req.body.password,(err,user)=>{ // PASSPORT FUNKSJONER SOM LAR OSS BRUKE .REGISTER METODEN
        if(err){
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req,res, ()=>{
                res.redirect("/docs")
            })
        }
    })

})

app.post("/login",(req,res)=>{

    const user = new User({ // DETTE ER HVORDAN EN NY BRUKER BLIR LAGET
        username:req.body.username,
        password:req.body.password
    })

    req.login(user,(err)=>{ // HER SJEKKER VI OM LOGINEN VIL FUNKE
        if (err) {
            console.log(err);
            // res.redirect("/failed") 
        } else {
            passport.authenticate("local")(req,res,()=>{ // HVIS DET FUNKET GJØR VI DETTE
                res.redirect("/docs") // HER BLIR BRUKEREN SENDT TIL DOKUMENTET
            })
        }
    })
})


// APP LISTEN
app.listen("3000",()=>{
    console.log("server started on 3000");
})