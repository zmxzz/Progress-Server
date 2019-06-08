const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User Schema
const TaskInfoSchema = mongoose.Schema({
    username: {
        type: String, 
        required: true
    },
    taskname: {
        type: String,
        required: true
    },
    accomplish: {
        type: String, 
        required: true
    },
    category: {
        type: String,
        required: true
    },
    timeSpent: {
        type: Number,
    },
    timeRequired: {
        type: Number
    },
    todoList: {
        type: [String]
    },
    doneList: {
        type: [Number]
    }
});

const TaskInfo = module.exports = mongoose.model('TaskInfo', TaskInfoSchema);

module.exports.addTask = function(newTask, callback) {
    newTask.save(callback);
}

module.exports.getTaskByID = function(id, callback) {
    TaskInfo.findById(id, callback);
}

module.exports.getTasksByUsername = function(username, callback) {
    TaskInfo.find({username: username}, callback);
}

module.exports.deleteTaskById = function(id, callback) {
    TaskInfo.deleteOne({_id: id}, callback);
}