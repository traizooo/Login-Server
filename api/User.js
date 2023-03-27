const express = require('express');
const router = express.Router();

const User = require('./../models/User');

const bcrypt = require('bcrypt');

router.post('/signup', (req, res) => {
    let {name, email, userName, password} = req.body;
    name = name.trim();
    email = email.trim();
    userName = userName.trim();
    password = password.trim();

    if (name == "" || email == "" || userName == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input fields!"
        });
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid name entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email entered"
        })
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Invalid user name entered"
        })
    } else if (password.lenght < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short!",
        })
    } else {
        User.find({email}).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User already exists"
                })
            } else {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        userName,
                        password: hashedPassword,
                    });

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                            data: result,
                        })
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error has occurred"
                        })
                    })
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error has occurred"
                    })
                })
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "Ann error has occurred",
            })
        })
    }
})
router.post('/signin', (req, res) => {
    let {userName, password} = req.body;
    userName = userName.trim();
    password = password.trim();   
    
    if (userName == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials supplied"
        }) 
    } else {
        User.find({userName})
        .then(data => {
            if (data.length) {
                const hashedPassword = data[0].password;
                bcrypt.compare(password, hashedPassword).then(result => {
                    if (result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Signin Successful",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Invalid password entered"
                        })
                    }
                })
                .catch(err => {
                    res.json ({
                        status: "FAILED",
                        message: "An error has occurred"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Invalid credentials entered"
                })
            }
        })
        .catch(err => {
            res.json({
                status: "FAILED",
                message: "An error has occurred"
            })
        })
    }
})

module.exports = router;