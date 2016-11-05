var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema   = new Schema({
    name: String,
    question: String,
    choices: Array,
    creator: String,
    pollId: String
});

module.exports = mongoose.model('Poll', Schema);
