var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sassMiddleware = require('node-sass-middleware');
var Polls = require('./public/models/polls');

var db = process.env.MONGOLAB_URI;

mongoose.connect(db);

var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function() {
  console.log('database connected');
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// Set Up Routes
var router = express.Router();

// Middleware for all requests
router.use(function(req, res, next) {
  next();
});

//landing page route

app.use('/', express.static(path.join(__dirname, 'public')));

// adding the sass middleware
app.use(
  sassMiddleware({
    src: __dirname + '/public/sass',
    dest: __dirname + '/public/css',
    debug: true,
    prefix:  '/css'
  })
);


router.route('/polls')

    //get all polls
    .get(function(req, res) {
      Polls.find(function(err, polls) {
        if (err) {res.send(err)};
        if (polls.length > 0) {
          res.json(polls);
        }
        else {
          res.json({data: [{
            "name": "pumpkin pie",
            "ingredients": ["pumpkin puree", "milk"]
          },
          {
            "name": "spaghetti",
            "ingredients": ["noodles", "tomato sauce"]
          }
        ]});
        }
          });
    })
    //create new poll
    .post(function(req, res) {

      var poll = new Poll();
      poll.name = req.body.name;
      poll.question = req.body.question;
      poll.choices = req.body.choices;
      poll.responses = req.body.responses;

      poll.save(function(err) {
        if (err) {res.send(err)};
        res.json({ message: 'new poll created!'});
      });
    });








// Register Routes
app.use('/', router);

// Start Server
app.listen(port);
console.log('Listening on ' + port);
