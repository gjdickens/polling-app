var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var sassMiddleware = require('node-sass-middleware');
var Poll = require('./public/models/polls');
var Account = require('./public/models/account');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var db = process.env.MONGOLAB_URI;

mongoose.connect(db);

var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function() {
  console.log('database connected');
});

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// Set Up Routes
var router = express.Router();

// passport config
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());


// Middleware for all requests
router.use(function(req, res, next) {
  next();
});


//TODO switch from static page to server side rendering to add user account logged in data


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
      Poll.find(function(err, polls) {
        if (err) {res.send(err)};
        if (polls.length > 0) {
          res.json({data: polls});
        }
        else {
          res.json({data: []});
        }
          });
    })
    //create new poll
    .post(function(req, res) {
      var poll = new Poll();
      poll.name = req.body.name;
      poll.choices = req.body.choices;
      poll.pollId = req.body.pollId;
      poll.creator = req.body.creator;

      poll.save(function(err, poll) {
        if (err) {console.log(err)};
        res.status(201).json(poll);
      });
    });

  router.route('/polls/:poll_id')

    //update poll by id
    .put(function(req, res) {
      Poll.findOne({'pollId': req.params.poll_id}, function(err, poll) {
        if (err) {res.send(err)}
        else {
          poll.name = req.body.name;
          poll.choices = req.body.choices;
          //save poll
          poll.save(function(err, poll) {
            if (err) {console.log(err)};
            res.status(201).json(poll);
          });
        }

      });
    })
    .get(function(req, res) {
      res.redirect(303, '/?' + req.params.poll_id);
    })

    .delete(function(req, res) {
      Poll.remove({
        pollId: req.params.poll_id
      }, function(err, poll) {
        if (err) {res.send(err)};
        res.json({ message: 'poll deleted' });
      });
    });


router.post('/register', function(req, res) {
    Account.register(new Account({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          console.log(err);
        }
        passport.authenticate('local')(req, res, function () {
            res.redirect('/');
        });
    });
});

router.post('/login', passport.authenticate('local'), function(req, res) {
    res.redirect('/');
});

router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

router.get('/checkIp', function(req, res) {
  var ip = req.headers['x-forwarded-for'] ||
     req.connection.remoteAddress ||
     req.socket.remoteAddress ||
     req.connection.socket.remoteAddress;
     res.json({ip: ip});
});





// Register Routes
app.use('/', router);

// Start Server
app.listen(port);
console.log('Listening on ' + port);
