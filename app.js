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
    extended:true // OFTE NÅR NOE ER SKREVET SLIKT ER DET FOR Å FORMATERE INNHOLDET PÅ EN ANNET MÅTE, OFTE GRUNNET DEPRIKASJON
}))


app.use(session({
    secret:process.env.SESSION_SECRET, // HEMMELIGHET SOM OPPBEVARES I EN .ENV FIL SOM .GITIGNORE FORHINDRER I Å BLI PUSHET
    resave: false,
    saveUninitialized:false
}))

app.use(passport.initialize()) // FOR Å BRUKE PASSPORT I EXPRESS
app.use(passport.session())

mongoose.connect("mongodb://localhost:27017/loginsDB", {useNewUrlParser: true}) // HER KOBLER VI OSS TIL DATABASEN VI ØNSKER Å BRUKE, MONGOOSE GJØR DETTE UTROLIG MYE LETTERE

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

const user = new User ({ // HER LAGDE JEG DEN FØRSTE BRUKEREN FOR Å HA NOE I DATABASEN FØRSTE GANG JEG BOOTER OPP
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

app.get("/docs",(req,res)=>{ // Å HA SJEKKEN ETTER MAN BLIR SENDT TIL SIDEN GJØR SIKKERHETEN BEDRE FORDI DET FORHINDRER OGSÅ AT BRUKERE KAN SKRIVE INN /DOCS I LINKEN OG KOMME RETT INN
    if(req.isAuthenticated()){ // SJEKKER OM DEN SOM SENDER REQUEST ER AUTENTISERT I SYSTEMET
        res.render("docs") // OM BRUKEREN ER AUTENTISERT BLIR DE SENDT TIL INNHOLDET TIL SIDEN
    } else {
        res.redirect("/login") // OM BRUKEREN IKKE ER AUTENTISERT BLIR DE SENDT TILBAKE TIL LOGIN
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
                res.redirect("/docs") // HER BLIR BRUKEREN SENDT TIL INNHOLDET I SIDEN
            })
        }
    })
})


// APP LISTEN
app.listen("3000",()=>{
    console.log("server started on 3000");
})