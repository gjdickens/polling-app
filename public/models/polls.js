var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema   = new Schema({
    name: String,
    question: String,
    choices: String,
    responses: Array,
    pollId: String
});

module.exports = mongoose.model('Poll', Schema);
