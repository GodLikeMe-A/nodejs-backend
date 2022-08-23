
const validator = require("validator")
const express = require("express")
const nunjucks = require("nunjucks")
const mongoose = require("mongoose")
const bodParser = require("body-parser")
const bycrypt = require("bcrypt")
const bodyParser = require("body-parser")

var port = 8080
var app = express()

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
        validator:isemail
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

app.get("/register", (req, res) => {

    res.render(__dirname + "/views/registeration.html")
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
                res.send("Don")

            })
        })
    })

})

app.get("/login", (req, res) => {
    res.render(__dirname + "/views/login.html")
})

app.post("/login", (req, res) => {
    users.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            bycrypt.compare(req.body.password, user.password, (err, matched) => {
                if (err) throw err;
                if (!matched) {
                    return res.render(__dirname + "/views/login.html", { errors: "Enter Password is Wrong" });

                }
                else {

                    res.redirect("/table")
                    console.log("Password Matched")
                }
            })
        }
        else {
            return res.render(__dirname + "/views/login.html", { emailcheck: "Invalid Email id" })
        }
    })
})


app.get("/table", (req, res) => {
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
