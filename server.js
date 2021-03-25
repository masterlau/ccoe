process.title = "ccoe" 
const debug = 1
const http = require("http")
const https = require("https")
const fs = require("fs")
const express = require("express")
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const md5 = require('md5')
const serveStatic = require('serve-static')
const httpport = 80
const sslport = 443

// AWS SDK
var AWS = require("aws-sdk");

// SSL Configs
const credentials = {
  key: fs.readFileSync("./keys/privkey.pem"),
  cert: fs.readFileSync("./keys/cert.pem"),
  ca: fs.readFileSync("./keys/chain.pem")
};

// UTILITIES

function jsonResponse(result, msg, res, req) {
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(200);
    res.end(JSON.stringify({ result: result, msg: msg }));
    return;
}

function validateEmail(email) {
    email = email.toLowerCase();
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function logIt(fnc, state, req, res) {

	if( debug ) console.log('Loggin It')
    var offset = 11;
    var timestamp = new Date();
    var utc = timestamp.getTime() + (timestamp.getTimezoneOffset() * 60000)  //This converts to UTC 00:00
    var theDate = new Date(utc + (3600000*offset))
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var dayOfWeek = theDate.getDay();
    var dayOfMonth = theDate.getDate();
    var Month = theDate.getMonth() + 1;
    var Year = theDate.getFullYear();
    var Hour = theDate.getHours();
    var Min = theDate.getMinutes();
    if( Min < 10 ) { Min = "0" + Min.toString(); }
    var tstamp = daysOfWeek[dayOfWeek] + " " + dayOfMonth + " " + months[Month-1] + " " + Year + " @ " + Hour + ":" + Min;

    var api;
    if( req.body.api == null ) {
        api = "";
    } else {
        api = req.body.api;
    }

    // Write to Console
    var logString = tstamp + " | " + fnc + " | " + state + " | URL: " + req.protocol + "://" + req.get('host') + req.originalUrl + " | API: " + api + " | User Ip: " + req.connection.remoteAddress + " | Params: " + JSON.stringify(req.params, null, 0) + " | Cookies: " + JSON.stringify(req.cookies, null, 0) + " | Request Body: " + JSON.stringify(req.body,null,0);
    //console.log(logString);
    //console.log('------------------------');

    // Append to Log File
    var filename = "/var/log/ccoe:" + sslport + ".log";
    fs.appendFile(filename, logString + "\n---------------------------\n", function (err) {
        if (err) throw err;
    });
}

function load(req, res, page, audio) {

    var file;
    switch(page) {
        case 'home':
            file = './templates/home.html';
            break;
        case 'audio':
            console.log("Audio: " + audio);
            if( file == null || $.trim(file) == "" || file != "promo-offline.mp3" || file != "show-01-may-2020.mp3") {
                res.setHeader('Content-Type', 'text/html');
                res.writeHead(404);
                res.end();
                return;
            } else {
                file = './www/audio/' + file;
            }
        default:
            file = './www/html/404.html';
    }

    if( page == "audio" ) {
        var stream = fs.createReadStream(file);
        stream.on('error', function(error) {
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(404);
            res.end();
        });
        res.setHeader('Content-Type', 'audio/mp3');
        stream.pipe(res);
    } else {
        fs.readFile(file, function (error, html) {
            if (error) {
                res.writeHead(404, 'Not Found');
                res.end();
                return;
            }
            res.setHeader('Content-Type', 'text/html');
            res.writeHead(200);
            res.end(html);
        });
    }
}

async function subscribe(req, res) {

	if( debug ) console.log('Function: Subscribe: Init');

    // Trim Whitespace Off Email
	email = req.body.email.toLowerCase()
    email = email.trim()
	var name = req.body.name.trim()
	var uid = md5(email)

    // Check if email valid
	if( debug ) console.log('Function: Subscribe: Checking Valid Email Format');
    if(!validateEmail(email)) {
        jsonResponse(false, "Email Address Incorret Format", res, req )
        logIt('subscribe','Error: email address format error', req, res)
        return
    }

    // Check if Email has Valid Domain
	if( debug ) console.log('Function: Subscribe: Checking Valid Email Domain ' + email);
    var esplit = email.split("@");
    if(!(esplit[1] == "optus.com.au" || esplit[1] == "trustwave.com" || esplit[1] == "ensyst.com.au" || esplit[1] == "optusbusiness.com.au")) {
        jsonResponse(false, "Sorry Optus Staff Only", res, req )
        logIt('subscribe','Error: domain name incorrect', req, res)
		if( debug ) console.log('FunctionError: domain name incorrect')
        return
    }

	// Check user to database, create token and email
	const mysql = require('mysql');

	const con = mysql.createConnection({
    	host: "ccoemysql.c3z4pwwo8gj4.ap-southeast-2.rds.amazonaws.com",
    	user: "master",
    	password: "0ptu$CC03",
		database : 'ccoe'
	});	

	var queryInsertUser = "\
INSERT IGNORE INTO users (uid, email, name) \
VALUES ('"+uid+"','"+email+"','"+name+"')";

	con.connect(function(err) {
    	if (err) throw err;

		con.query(queryInsertUser, function(error, result, fields) {
			if( !error ) {
        		console.log(result)
			} else {
				console.log( error );
			}
    	});

    	con.end();
	});

}

async function initExpress() {

	// Express Web Server 
	const app = express();
	app.use(bodyParser.json());
	app.use(cookieParser());
	app.use(express.static('/root/ccoe/www'));

	// Homepage
	app.get ('/', (req, res) => {
    	if( !req.cookies.token || !req.cookies.email || !req.cookies.user ) {
    	    // Load Homepage
        	load(req, res, 'home');
    	} else {
        	// Check Session
        	checkSession(req, res);
    	}
	});

	// Subscribe
	app.post('/subscribe', (req, res) => {
		if( debug ) console.log('End Point: Subscribe');
		subscribe(req, res); 
	});

	// Start HTTP Server
	http.createServer(function (req, res) {
    	console.log("Received Port " + httpport + " Request, Redirected to port " + sslport);
    	res.writeHead(301, { "Location": "https://" + req.headers['host'] + ":" + sslport + req.url });
    	res.end();
	}).listen(httpport, () => {
    	console.log("HTTP Server on port " + httpport + " forwarding to port " + sslport );
	});

	// Start HTTPS Server
	const httpsServer = https.createServer(credentials, app);
	httpsServer.listen(sslport, () => {
	    console.log("HTTPS Server running on port " + sslport + "\n");
	});

}

// MAIN PROGRAM 
initExpress()
