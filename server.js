
const validator = require("validator")
const express = require("express")
const nunjucks = require("nunjucks")
const mongoose = require("mongoose")
const bodParser = require("body-parser")
const bycrypt = require("bcrypt")
const bodyParser = require("body-parser")
const passport = require("passport")
const flash = require('connect-flash');
var session = require('express-session');
var cookieParser = require('cookie-parser')
const Localstrategy = require("passport-local").Strategy



var port = 8080
var app = express()

app.use(session({
    secret: "Amit@123",
    resave: true,
    saveUninitialized: true,

}));


app.use(flash())
app.use(cookieParser())

app.use(passport.initialize())
app.use(passport.session())


var url = "mongodb://127.0.0.1:27017/register"
mongoose.connect(url)


var users = mongoose.model("registerationinfo", {
    fname: {
        type: String,
        required: [true, "Enter Value"]
    },

    surname: {
        type: String,
        required: [true, "Enter Surname"]
    },

    email: {
        type: String,
        required: [true, "Email Required"],
    },
    password: {
        type: String,
        required: [true, "Password require"],

    }

})

nunjucks.configure('views', {
    autoescape: true,
    express: app
});
app.set("view-engine", "nunjucks")
app.use(bodyParser.json())
app.use(bodParser.urlencoded({ extended: true }))




app.get("/", (req, res) => {
    res.render(__dirname + "/views/home.html")
})


//user database


app.post("/register", (req, res) => {
    var data = new users();
    data.fname = req.body.fname,
        data.surname = req.body.surname,
        data.email = req.body.email,
        data.password = req.body.password

    bycrypt.genSalt(10, (err, salt) => {
        if (err) throw err
        bycrypt.hash(data.password, salt, (err, hash) => {
            data.password = hash

            data.save((err, user) => {
                if (err) throw err
                console.log("Data Inserted")
                res.redirect("/login")

            })
        })
    })

})


var checkLogin = function(req ,res ,next){
    if(req.isAuthenticated()){ return res.redirect("/login")}
    next()
}

app.get("/register", checkLogin, (req, res) => {

    res.render(__dirname + "/views/registeration.html")
})

app.get("/login", checkLogin,(req, res ) => {
    res.render(__dirname + "/views/login.html")
})


passport.use(new Localstrategy({ usernameField: "email" }, (email, password, done) => {
    users.findOne({ email: email }).then(user => {
        if (!user) return done(null, false, { Message: "No USer " })
        bycrypt.compare(password, user.password, (err, match) => {
            if (err) return err
            if (match) {
                return done(null, user)
            }
            else {
                return done(null, false, { Message: "Inalid PAssword" })
            }
        })

    })
}))

app.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/table",
        failureRedirect: "/login",
        failureFlash: true
    })(req, res, next);

});

passport.serializeUser(function (user, done) {
    done(null, user.id)
})

passport.deserializeUser(function (id, done) {
    users.findById(id, function (err, user) {
        done(err, user)
    })
})

app.post("/logout", (req, res, next) => {
    req.logOut(function (err) {
        if (err) { return next(err) }
    })
    res.redirect("/login")
})

// Without any session just for understanding bycrypt use this
// app.post("/login", (req, res) => {
//     users.findOne({ email: req.body.email }).then((user) => {
//         if (user) {
//             bycrypt.compare(req.body.password, user.password, (err, matched) => {
//                 if (err) throw err;
//                 if (!matched) {
//                     return res.render(__dirname + "/views/login.html", { errors: "Enter Password is Wrong" });

//                 }
//                 else {

//                     res.redirect("/table")
//                     console.log("Password Matched")

//                 }
//             })
//         }
//         else {
//             return res.render(__dirname + "/views/login.html", { emailcheck: "Invalid Email id" })
//         }
//     })
// })


var checkAuth = function(req ,res ,next){
    if(req.isAuthenticated()){return next()}
    res.redirect("/login")
}
app.get("/table",checkAuth ,(req, res) => {
    users.find().then(user => {
        res.render(__dirname + "/views/table.html", { user: user })
    })
})

app.get("/edit/:id", (req, res) => {
    users.findOne({ _id: req.params.id }).then((info) => {

        res.render(__dirname + "/views/edit.html", { info: info })
    })
})



app.post("/edit/:id", (req, res) => {
    users.findOne({ _id: req.params.id }).then((info) => {
        info.fname = req.body.fname
        info.surname = req.body.surname
        info.email = req.body.email

        info.save(function (err, data) {
            if (err) throw err
            res.redirect("/table")
        })


    })
})

app.post("/delete/:id", (req, res) => {
    users.deleteOne({ _id: req.params.id }).then(erase => {

        res.redirect("/table")
        console.log("Data Deleted")
    })
})




app.all("/userposts", (req, res) => {

    users.find().then(user => {
        res.render(__dirname + "/views/random.html", { user: user })
    })
})


app.listen(port);
