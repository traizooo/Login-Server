// Load environment variables from a .env file
require('dotenv').config();
const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const UserVerification = require('./../models/UserVerification');
const UserOTPVerification = require('./../models/UserOTPVerification')
const PasswordReset = require("./../models/PasswordReset");
const nodemailer = require("nodemailer");
const {v4: uuidv4} = require("uuid");
const bcrypt = require("bcrypt");
const path = require("path");

let transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
    }
});

transporter.verify((error, success) => {
    if(error) {
        console.log(error)
    } else {
        console.log("------------")
        console.log("EMAIL READY!")
        console.log("------------")
    }
});

router.post('/signup', (req, res) => {
    let {name, email, userName, password} = req.body;
    name = name.trim();
    email = email.trim();
    userName = userName.trim();
    password = password.trim();

    if (name == "" || email == "" || userName == "" || password == "") {
        throw Error("Empty input fields!")
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        throw Error("Invalid name entered!")
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        throw Error("Invalid email entered!")
    } else if (!/^[a-zA-Z ]*$/.test(name)) {
        throw Error("Invalid user name entered!")
    } else if (password.lenght < 8) {
        throw Error("Password too short!")
    } else {
        User.find({email}).then(result => {
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "User already exists!"
                });
            } else {
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds).then(hashedPassword => {
                    const newUser = new User({
                        name,
                        email,
                        userName,
                        password: hashedPassword,
                        verified: false,
                    });

                    newUser.save().then(result => {
                        //sendVerificationEmail(result, res);
                        sendVerificationEmail(result, res);
                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error has occurred"
                        });
                    });
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error has occurred"
                    });
                });
            }
        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "Ann error has occurred",
            });
        });
    }
});

const sendOTPVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your Account",
            html: `<div style="background-color: #f2f8fc; padding: 20px; text-align: center;">
            <p style="font-family: Arial, sans-serif; font-size: 20px; color: #333;">
              Enter: <span style="font-weight: bold; color: #007bff; font-size: 24px;">${otp}</span> in the app to verify your email address and complete the signup process.
              <br>
              This code <b>expires in 1 hour!</b>
            </p>
          </div>`
        };

        const saltRounds = 10;
        const hashedOTP = await bcrypt.hash(otp, saltRounds);
        const newOTPVerification = await new UserOTPVerification({
            userId: _id,
            otp: hashedOTP,
            createdAt: Date.now(),
            expiresAt: Date.now() + 3600000,
        });
        await newOTPVerification.save();
        await transporter.sendMail(mailOptions);
        res.json({
            status: "PENDING",
            message: "Verification otp email sent",
            data: {
                userId: _id,
                email,
            },
        });
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        });
    }
}

router.post("/verifyOTP", async (req, res) => {
    try {
        let {userId, otp} = req.body;
        
        if(!userId || !otp) {
            throw Error("Empty otp details are not allowed");
        } else {
            const UserOTPVerificationRecords = await UserOTPVerification.find({
                userId,
            });
            if (UserOTPVerificationRecords.length <= 0) {
                throw new Error(
                    "Account record doesn't exist or has been already verified. Please sign up or log in"
                );
            } else {
                const {expiresAt} = UserOTPVerificationRecords[0];
                const hashedOTP = UserOTPVerificationRecords[0].otp;

                if (expiresAt < Date.now()) {
                    await UserOTPVerification.deleteMany({userId});
                    throw new Error("Code has expired. Please request again.");
                } else {
                    const validOTP = await bcrypt.compare(otp, hashedOTP);

                    if (!validOTP) {
                        throw new Error("Invalid code passed. Check your inbox.");
                    } else {
                        await User.updateOne({_id: userId}, {verified: true});
                        await UserOTPVerification.deleteMany({userId});
                        res.json({
                            status: "VERIFIED",
                            message: `User email verified successfully.`
                        })
                    }
                }
            }
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
});

router.post("/resendOTPVerificationCode", async (req, res) => {
    try {
        let {userId, email} = req.body;

        if (!userId || !email) {
            throw Error("Empty user details are not allowed")
        } else {
            await UserOTPVerification.deleteMany({userId});
            sendOTPVerificationEmail({_id: userId, email}, res)
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: error.message,
        })
    }
});

const sendVerificationEmail = ({_id, email}, res) => {
    const currentURL = "http://localhost:3000/";
    const uniqueString = uuidv4() + _id;
    const mailOptions = {
        from: process.env.AUTH_EMAIL,
        to: email,
        subject: "Verify your Email",
        html: `<p>Verify your email address to complete the signup and login into your account.</p><p>This link 
        <b>expires in 6 hours</b>.</p><p>Press <a href=${currentURL + "user/verify/" + _id + "/" + uniqueString}>HERE</a>
        to proceed.</p>`,
    };

    const saltRounds = 10;
    bcrypt
        .hash(uniqueString, saltRounds)
        .then((hashedUniqueString) => {
            const newVerification = new UserVerification ({
                userId: _id,
                uniqueString: hashedUniqueString,
                createdAt: Date.now(),
                expiresAt: Date.now() + 21600000,
            });

            newVerification
                .save()
                .then(() => {
                    transporter.sendMail(mailOptions)
                    .then(() => {
                        res.json({
                        status: "PENDING",
                        message: "Verification email sent!",
                        data: {
                            userId: _id,
                            email,
                        }
                        })  
                    })
                    .catch((error) => {
                        console.log(error);
                        res.json({
                        status: "FAILED",
                        message: "Verification email failed"
                        });
                    })
                })
                .catch((error) => {
                    res.json({
                    status: "FAILED",
                    message: "Couldn't save verification email data"
                })                      
            })
        })
        .catch(() => {
            res.json({
            status: "FAILED",
            message: "An error occurred while hashing email data"
            });             
        });
};

router.post("/resendVerificationLink", async (req, res) => {
    try {
        let { userId, email } = req.body;

        if (!userId || !email) {
            throw Error("Empty user details are not allowed");
        } else {
            await UserVerification.deleteMany({ userId });
            sendVerificationEmail({_id: userId, email}, res);
        }
    } catch (error) {
        res.json({
            status: "FAILED",
            message: `Verification Link Resend Error. ${error.message}`
        });
    }
});

router.get("/verify/:userId/:uniqueString", (req, res) => {
    let {userId, uniqueString} = req.params;

    UserVerification
        .find({userId})
        .then((result) => {
            if (result.length > 0) {

                const {expiresAt} = result[0];
                const hashedUniqueString = result[0].uniqueString;

                if (expiresAt < Date.now()) {
                    UserVerification
                        .deleteOne({ userId})
                        .then(result => {
                            User
                                .deleteOne({_id: userId})
                                .then(() => {
                                    let message = "The link has expired. Please sign up again.";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                                .catch(error => {
                                    let message = "Clearing user with expired unique string failed";
                                    res.redirect(`/user/verified/error=true&message=${message}`);
                                })
                        })
                        .catch((error) => {
                            console.log(error);
                            let message = "An error occurred while clearing expired user verification record";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                } else {
                    bcrypt
                        .compare(uniqueString, hashedUniqueString)
                        .then(result => {
                            if (result) {
                                User
                                    .updateOne({_id: userId}, {verified: true})
                                    .then(() => {
                                        UserVerification
                                            .deleteOne({userId})
                                            .then(() => {
                                                res.sendFile(path.join(__dirname, "./../views/verified.html"));
                                            })
                                            .catch(error => {
                                                console.log(error);
                                                let message = "An error occurred while finalizing successful verification";
                                                res.redirect(`/user/verified/error=true&message=${message}`);
                                            })
                                    })
                                    .catch(error => {
                                        console.log(error);
                                        let message = "An error occurred while updating user record";
                                        res.redirect(`/user/verified/error=true&message=${message}`);
                                    })

                            } else {
                                let message = "Invalid verification details passed. Check your inbox";
                                res.redirect(`/user/verified/error=true&message=${message}`);
                            }
                        })
                        .catch(error => {
                            let message = "An error occurred while comparing unique strings";
                            res.redirect(`/user/verified/error=true&message=${message}`);
                        })
                }
            } else {
                let message = "Account record doesn't exists or has been already verified";
                res.redirect(`/user/verified/error=true&message=${message}`);
            }
        })
        .catch((error) => {
            console.log(error);
            let message = "An error occurred while checking for existing user verification record";
            res.redirect(`/user/verified/error=true&message=${message}`);
        })
});

router.get("/verified", (req, res) => {
    res.sendFile(path.join(__dirname, "./../views/verified.html"));
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

                if (!data[0].verified) {
                    res.json({
                    status: "FAILED",
                    message: "Email hasn't been verified"
                })
            } else {
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
                    });
                });
            }

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

router.post("/requestPasswordReset", (req, res) => {
    const {email, redirectURL} = req.body;

    User
        .find({email})
        .then((data) => {
            if (data.length) {
                if (!data[0].verified) {
                    res.json({
                        status: "FAILED",
                        message: "Email hasn't been verified yet. Check your inbox"
                    })
                } else {
                    sendResetEmail(data[0], redirectURL, res);
                }
            } else {
                res.json({
                    status: "FAILED",
                    message: "No account with the supplied email exists"
                })
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "An error has occurred"
            })
        })
})

const sendResetEmail = ({_id, email}, redirectURL, res) => {
    const resetString = uuidv4() + _id;

    PasswordReset
        .deleteMany({userId: _id})
        .then(result => {
            const mailOptions = {
                from: process.env.AUTH_EMAIL,
                to: email,
                subject: "Password Reset",
                html: `<p>You requested password reset</p><p>This link 
                <b>expires in 60 minutes</b>.</p><p>Press <a href=${redirectURL + "/" + _id + "/" + resetString}>HERE</a>
                to proceed.</p>`,
            };

            const saltRounds = 10;
            bcrypt
                .hash(resetString, saltRounds)
                .then(hashedResetString => {
                    const newPasswordReset = new PasswordReset({
                        userId: _id,
                        resetString: hashedResetString,
                        createdAt: Date.now(),
                        expiresAt: Date.now() + 3600000
                    });

                    newPasswordReset
                        .save()
                        .then(() => {
                            transporter
                                .sendMail(mailOptions)
                                .then(() => {
                                    res.json({
                                        status: "PENDING",
                                        message: "Password reset email sent!",
                                    })
                                })
                                .catch(error => {
                                    console.log(error);
                                    res.json({
                                        status: "FAILED",
                                        message: "Password reset email failed"
                                    })
                                })
                        })
                        .catch(error => {
                            console.log(error);
                            res.json({
                                status: "FAILED",
                                message: "Couldn't save password reset data."
                            })
                        })
                })
                .catch(error => {
                    console.log(error);
                    res.json({
                        status: "FAILED",
                        message: "An error occured while hashing password"
                    })
                })
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Clearing existing password reset records failed"
            })
        })
}

router.post("/resetPassword", (req, res) => {
    let {userId, resetString, newPassword} = req.body;

    PasswordReset
        .find({userId})
        .then(result => {
            if (result.length > 0) {

                const {expiresAt} = result[0];
                const hashedResetString = result[0].resetString;

                if (expiresAt < Date.now()) {
                    PasswordReset
                        .deleteOne({userId})
                        .then(() => {
                            res.json({
                                status: "FAILED",
                                message: "Password reset link has expired"
                            })
                })
                        .catch(error => {
                            console.log(error)
                            res.json({
                                status: "FAILED",
                                message: "Clearing existing password reset records failed"
                            })
                        })
                } else {
                    bcrypt
                        .compare(resetString, hashedResetString)
                        .then(() => {
                            if (result) {
                                
                                const saltRounds = 10;
                                bcrypt
                                    .hash(newPassword, saltRounds)
                                    .then(hashedNewPassword => {
                                        
                                        User
                                            .updateOne({_id: userId}, {password: hashedNewPassword})
                                            .then(() => {
                                                PasswordReset
                                                    .deleteOne({userId})
                                                    .then(() => {
                                                        res.json({
                                                            status: "SUCCESS",
                                                            message: "Password has been reset successfully."
                                                        })
                                                    })
                                                    .catch(error => {
                                                        console.log(error);
                                                        res.json({
                                                            status: "FAILED",
                                                            message: "An error occured while finalizing password reset"
                                                        })
                                                    })
                                            })
                                            .catch(error => {
                                                res.json({
                                                    status: "FAILED",
                                                    message: "Updating user password failed"
                                                })
                                            })

                                    })
                                    .catch(error => {
                                        console.log(error);
                                        res.json({
                                            status: "FAILED",
                                            message: "An error occured while hashing new password"
                                        })
                                    });
                            } else {
                                res.json({
                                    status: "FAILED",
                                    message: "Invalid password reset details passed"
                                })
                            }
                        })
                        .catch(error => {
                            res.json({
                                status: "FAILED",
                                message: "Comparing password reset string failed"
                            })
                        })
                }
            } else {
                res.json({
                    status: "FAILED",
                    message: "Password reset request not found"
                })
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: "FAILED",
                message: "Checking for existing password reset record failed"
            })
        })
});

module.exports = router;