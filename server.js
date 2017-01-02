var express = require('express');
var faker = require('faker'); //faker generates a random user
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

var jwtSecret = 'oi1q3h4ropiu(*P#240u09)';

var user = {
  username: 'test',
  password: 't'
}

var app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(expressJwt({ secret: jwtSecret }).unless({ path: ['/login']}));

app.get('/random-user', function(req, res) {
  var user = faker.helpers.userCard();
  res.json(user);
})

app.post('/login', authenticate, function(req, res) {
  var token = jwt.sign({
    username: user.username,
  }, jwtSecret);
  res.send({
    user: user,
    token: token
  }); //if they made it here then it means they passed through authenticate (valid authentication)
})

app.get('/me', function(req, res) {
  res.send(req.user);
})

app.listen(3000, function() {
  console.log('listening on port 3000');
});


function authenticate(req, res, next) {
  var body = req.body;
  if (!body.username || !body.password) {
    res.status(400).end('Must provide username / password');
  }
  if (body.username !== user.username || body.password != user.password) {
    res.status(401).end('Username or password incorrect');
  }
  next();
}
