VERSION = require(pathThumbnails + '/VERSION.js');
var secure = false;
var path = require('path');
try {
	var cert_config = require(path.join(path.join(__dirname, '../config/'), 'cert_config.js'));
	var fs = require('fs');
	var privateKey  = fs.readFileSync(cert_config.privateKey).toString();
	var certificate = fs.readFileSync(cert_config.certificate).toString();
	var ca          = fs.readFileSync(cert_config.ca).toString();
	var credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};
	secure = true;
} catch(err){}

var add = "";
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var cors = require('cors');

var hbs = exphbs.create({
	defaultLayout: publicPath + '/layouts/client/main',
	layoutsDir: publicPath + '/layouts/client',
	partialsDir: publicPath + '/partials'
});
var uniqid = require('uniqid');


app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
app.enable('view cache');
app.set('views', publicPath);
app.set('trust proxy', '127.0.0.1');

var bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
var helmet = require('helmet')
app.use(helmet({
  frameguard: false
}));
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
	extended: true
}));
app.use(cookieParser());
app.set('json spaces', 2);

io = require('socket.io')({
	pingTimeout: 25000,
	//path: '/zoff',
	//"origins": ("https://zoff.me:443*,https://zoff.me:8080*,zoff.me:8080*,https://remote.zoff.me:443*,https://remote.zoff.me:8080*,https://fb.zoff.me:443*,https://fb.zoff.me:8080*,https://admin.zoff.me:443*,https://admin.zoff.me:8080*, http://localhost:8080*")});
});

var socketIO = require(pathThumbnails +'/handlers/io.js');
socketIO();

app.socketIO = io;


/* Globally needed "libraries" and files */
var Functions = require(pathThumbnails + '/handlers/functions.js');
var router = require(pathThumbnails + '/routing/client/router.js');
var api = require(pathThumbnails + '/routing/client/api.js');
var ico_router = require(pathThumbnails + '/routing/client/icons_routing.js');

app.get('/robots.txt', function (req, res) {
	res.type('text/plain');
	res.send("User-agent: *\nAllow: /$\nDisallow: /");
});

app.use(function (req, res, next) {
	var cookie = req.cookies._uI;
	if (cookie === undefined) {
		var user_name = Functions.hash_pass(Functions.rndName(uniqid.time(), 15));
		res.cookie('_uI', user_name, {
            maxAge: 365 * 10000 * 3600000,
            httpOnly: true,
            secure: secure,
            sameSite: true,
        });
	} else {
		res.cookie('_uI', cookie, {
            maxAge: 365 * 10000 * 3600000,
            httpOnly: true,
            secure: secure,
            sameSite: true,
        });
	}
	res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.use('/service-worker.js', function(req, res) {
	res.sendFile(publicPath + '/service-worker.js');
});

app.use('/', ico_router);
app.use('/', api);
app.use('/', cors(), router);

app.use('/assets/js', function(req, res, next) {
    res.sendStatus(403);
    return;
});

app.use('/assets/admin', function(req, res, next) {
    res.sendStatus(403);
    return;
});

app.use('/assets', express.static(publicPath + '/assets'));

app.use(function (req, res, next) {
  res.status(404);
  res.redirect("/404");
})

module.exports = app;
