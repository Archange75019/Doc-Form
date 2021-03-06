var createError = require('http-errors');
var userctrl = require('./controllers/user');
var docctrl = require('./controllers/docs');
var fs = require('fs');
var express = require('express')
var bodyParser = require('body-parser')
flash = require('connect-flash')
,session = require('express-session')
,cookieParser = require('cookie-parser')
,toastr = require('toastr');
var path = require('path');
var mongoose = require('mongoose');
var logger = require('morgan');
require('dotenv').config()

var indexRouter = require('./routes/index');
var appRouter = require('./routes/app');
var adminRouter = require('./routes/admin');
var auth = require('./middleware/auth');

var app = express();
app.set('strict routing', true)
 

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.json());
app.use(express.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


app.use(cookieParser('secret'));
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

mongoose.connect(process.env.DB_URL,
  { useNewUrlParser: true,
    useUnifiedTopology: true,
  useCreateIndex: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

app.use(cookieParser());
app.use(logger('dev'));

app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser('secret'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(__dirname + '/uploads'));
var accessLogStream = fs.createWriteStream(path.join(__dirname, './controllers/organigramme/access.csv'), { flags: 'a' })

app.use(logger('combined', { stream: accessLogStream }))

app.use('/', indexRouter);
app.use('/app', auth, appRouter);
app.use('/admin', auth, adminRouter);
app.use(flash());

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

module.exports = app;
