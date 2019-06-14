const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/online_base');
const Task = require('../models/task_model');
const Commit = require('../models/commit_model');

// Below is for GET api
// Check if the token is valid
router.get('', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Check if the user has the right to get tasks
router.get('', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    var username = decoded.username;
    Task.getTasksByUsername(username, (err, tasks) => {
        if (err) {
            return res.status(400).end();
        }
        return res.json({
            tasks: tasks
        });
    });
});

// Below is for ADD api
// Check if token is valid
router.post('/add', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Add task in hours
router.post('/add', (req, res, next) => {
    if (req.body.accomplish !== 'hours') {
        next();
        return;
    }
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    let newTask = new Task({
        username: decoded.username,
        taskname: req.body.taskname,
        accomplish: 'hours',
        category: req.body.category,
        timeSpent: req.body.timeSpent,
        timeRequired: req.body.timeRequired
    });
    addTask(newTask, res);
});

// Add task in todo list
router.post('/add', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    let newTask = new Task({
        username: decoded.username,
        taskname: req.body.taskname,
        accomplish: 'todoList',
        category: req.body.category,
        todoList: req.body.todoList,
        doneList: req.body.doneList
    });
    addTask(newTask, res);
});

// Add task helper function
function addTask(newTask, res) {
    Task.addTask(newTask, (err, task) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                msg: 'Failed to add task'
            });
        }
        else {
            res.json({
                success: true,
                msg: 'Task added'
            });
        }
    });
}


// Below handles commit api
router.post('/commit', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Commit task
router.post('/commit', (req, res, next) => {
    Task.getTaskByID(req.body._id, (err, task) => {
        if (err || task === null) {
            return res.json({ success: false });
        }
        if (task.accomplish === 'hours') {
           task.timeSpent = req.body.timeSpent;
        }
        else {
            task.doneList = req.body.doneList;
        }
        task.save();
    });
    next();
});

router.post('/commit', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    var username = decoded.username;
    var now = new Date();
    var month = now.getMonth() < 10 ? '0' + now.getMonth() : '' + now.getMonth();
    var day = now.getDay() < 10 ? '0' + now.getDay() : '' + now.getDay();
    var date = now.getFullYear() + '-' + month + '-' + day;
    let newCommit = new Commit({
        username: username,
        date: date,
        total: req.body.accomplish === 'hours' ? (req.body.timeSpent * 3600) : (req.body.doneList.length * 3600),
        details: []
    });
    Commit.addCommit(newCommit, (err, commit) => {
        if (err) {
            console.log(err);
            res.json({
                success: false,
                msg: 'Failed to add commit'
            });
        }
        else {
            res.json({
                success: true,
                msg: 'Task added'
            });
        }
    });
});

// Below handles DELETE api
router.delete('', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Delete task
router.delete('', (req, res, next) => {
    Task.deleteTaskById(req.body._id, (err) => {
        if (err) {
            return res.status(400).end();
        };
    })
    res.json({
        success: true
    })
});

router.get('/commit', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

router.get('/commit', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    var username = decoded.username;
    Commit.getCommitsById(username, (err, commits) => {
        if (err) {
            return res.status(400).end();
        }
        return res.json({
            commits: commits
        });
    });
});

module.exports = router;
