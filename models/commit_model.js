const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const CommitInfoSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    details: {
        type: [String],
        required: true
    }
});

const CommitInfo = module.exports = mongoose.model('CommitInfo', CommitInfoSchema);

module.exports.getCommitsById = function(username, callback) {
    CommitInfo.find({username: username}, callback);
}

module.exports.addCommit = function(newCommit, callback) {
    newCommit.save(callback);
}