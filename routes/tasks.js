const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/online_base');
const Task = require('../models/task_model');

// Below is for GET api
// Check if the token is valid
router.get('', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Check if the user has the right to get tasks
router.get('', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    if (decoded.username !== req.body.username) {
        return res.status(401).send();
    }
    next();
});

// Return tasks
router.get('', (req, res, next) => {
    Task.getTasksByUsername(req.body.username, (err, tasks) => {
        if (err) {
            return res.status(400).end();
        }
        return res.json({
            tasks: tasks
        });
    });
})

// Below is for ADD api
// Check if token is valid
router.post('/add', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Check if the user has the right to add task
router.post('/add', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    if (decoded.username !== req.body.username) {
        return res.status(401).send();
    }
    next();
});

// Add task in hours
router.post('/add', (req, res, next) => {
    if (req.body.accomplish !== 'hours') {
        next();
        return;
    }
    let newTask = new Task({
        username: req.body.username,
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
    let newTask = new Task({
        username: req.body.username,
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

// Check if the user has the right to add task
router.post('/commit', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    if (decoded.username !== req.body.username) {
        return res.status(401).send();
    }
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
        res.json({
            success: true
        });
    });
});

// Below handles DELETE api
router.delete('', passport.authenticate('jwt', {session: false}), (req, res, next) => {
    next();
});

// Check if the user has the right to delete task
router.delete('', (req, res, next) => {
    var decoded = jwt.verify(req.headers['authorization'].substring(4), config.secret);
    if (decoded.username !== req.body.username) {
        return res.status(401).send();
    }
    next();
});

// Delete task
router.delete('', (req, res, next) => {
    Task.deleteTaskById(req.body._id, (err) => {
        if (err) {
            return res.status(400).end();
        };
    })
    res.status(200).end();
})

module.exports = router;
