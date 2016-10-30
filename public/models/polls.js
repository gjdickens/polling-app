var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Schema   = new Schema({
    name: String,
    question: String,
    choices: Array,
    responses: Array
});

module.exports = mongoose.model('Polls', Schema);
