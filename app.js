var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
var logger = require('morgan');
var routes = require('./routes/routes');
var app = express();
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({ extended: true }))

app.get("/", function (req, res) {
  res.send("node is running on port 3000")
})

app.use('/api/', routes)
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

if (module === require.main) {
  var server = app.listen(process.env.PORT || 8000, function () {
      var port = server.address().port;
      console.log("App listening on port %s", port);
  });
}

module.exports = app;

