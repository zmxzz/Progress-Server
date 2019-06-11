const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/online_base');
const User = require('../models/user_model');

// Register
router.post('/register', (req, res, next) => {
    if (!req.body.email || !req.body.username || !req.body.passport) {
        return res.status(400).send('Incomplete Information');
    }
    next();
});

router.post('/register', (req, res, next) => {
    let newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password,
    });

    User.addUser(newUser, (err, user) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                msg: 'Failed to register user'
            });
        }
        else {
            res.json({
                success: true,
                msg: 'User registered'
            });
        }
    });

});

// Authenticate
router.post('/authenticate', (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) {
            throw err;
        }
        if (!user) {
            return res.json({
                success: false,
                msg: 'User Not Found'
            })
        }
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) {
                throw err;
            }
            if (isMatch) {
                const token = jwt.sign(user.toJSON(), config.secret, {
                    expiresIn: 86400
                });
                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        username: user.username,
                        email: user.email
                    } 
                });
            }
            else {
                res.json({
                    success: false,
                    msg: 'Wrong Password'
                });
            }
        });
    });
});

// Validate if token has expired
router.get('/validate', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({success: true});
});

// Profile
router.get('/profile', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    res.json({user: req.user});
});


module.exports = router;