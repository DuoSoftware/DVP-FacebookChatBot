var restify = require('restify');
var fs = require('fs');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var config = require('config');
var jwt = require('restify-jwt');
var mongoose = require('mongoose');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
var request = require("request");
var format = require("stringformat");
var validator = require('validator');
var fb = require('./Services/FacebookClient');

var util = require('util');
var port = config.Host.port || 3000;
var host = config.Host.vdomain || 'localhost';
var serverType = config.Host.ServerType;
var callbackOption = config.Host.CallbackOption;
var requestType = config.Host.RequestType;
var serverID = config.Host.ServerID;
var token = config.Services.accessToken;




restify.CORS.ALLOW_HEADERS.push('authorization');
// Setup some https server options

// Instantiate our two servers
var server = restify.createServer({
    name: "DVP Engagement Service"
});


var https_options = {
    /*ca: fs.readFileSync('/etc/ssl/fb/COMODORSADomainValidationSecureServerCA.crt'),
    key: fs.readFileSync('/etc/ssl/fb/SSL1.txt'),
    certificate: fs.readFileSync('/etc/ssl/fb/STAR_duoworld_com.crt')*/
};

var https_server = restify.createServer(https_options);


// Put any routing, response, etc. logic here. This allows us to define these functions
// only once, and it will be re-used on both the HTTP and HTTPs servers
var setup_server = function (server) {

    server.pre(restify.pre.userAgentConnection());
    server.use(restify.bodyParser({mapParams: false}));
    server.use(restify.queryParser());
    server.use(restify.CORS());
    server.use(restify.fullResponse());

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    server.get('/', function(req, res) {
        console.log(req);
        res.send('It works!');
    });

    server.get('/webhook', function(req, res) {
        if (
            req.params.hub.mode == 'subscribe' &&
            req.params.hub.verify_token == 'token'
        ) {
            res.setHeader('content-type', 'text/plain');
            res.send(req.params.hub.challenge);
            /*res.send(req.params.hub.challenge.toString());*/
        } else {
            res.send(400);
        }
    });

    server.post('/webhook', function (req, res) {
        var data = req.body;

        // Make sure this is a page subscription
        if (data.object === 'page') {

            // Iterate over each entry - there may be multiple if batched
            data.entry.forEach(function(entry) {
                var pageID = entry.id;
                var timeOfEvent = entry.time;

                // Iterate over each messaging event
                entry.messaging.forEach(function(event) {
                    if (event.message) {
                        receivedMessage(event);
                    } else {
                        console.log("Webhook received unknown event: ", event);
                    }
                });
            });

            // Assume all went well.
            //
            // You must send back a 200, within 20 seconds, to let us know
            // you've successfully received the callback. Otherwise, the request
            // will time out and we will keep trying to resend.
            res.sendStatus(200);
        }
    });

    function receivedMessage(event) {
        // Putting a stub for now, we'll expand it in the following steps
        console.log("Message data: ", event.message);
    }

};

// Now, setup both servers in one step
setup_server(https_server);

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.CORS());
server.use(restify.fullResponse());
server.use(jwt({secret: secret.Secret}));


/*-----------------------------Facebook------------------------------------------*/

/*server.get('DVP/API/:version/Social/Facebook/accounts', authorization({
    resource: "social",
    action: "read"
}), fb.GetFacebookAccounts);

server.post('DVP/API/:version/Social/Facebook', authorization({
    resource: "social",
    action: "write"
}), fb.CreateFacebookAccount);

server.del('DVP/API/:version/Social/Facebook/:id', authorization({
    resource: "social",
    action: "write"
}), fb.DeleteFacebookAccount);

server.put('DVP/API/:version/Social/Facebook/:id', authorization({
    resource: "social",
    action: "write"
}), fb.ActiveteFacebookAccount);*/

/*-----------------------------Facebook------------------------------------------*/


https_server.listen(443, function () {
    console.log('%s listening at %s', https_server.name, https_server.url);
});

// Start our servers to listen on the appropriate ports
server.listen(port, function () {
    logger.info("DVP-LiteTicket.main Server %s listening at %s", server.name, server.url);
});


var mongoip = config.Mongo.ip;
var mongoport = config.Mongo.port;
var mongodb = config.Mongo.dbname;
var mongouser = config.Mongo.user;
var mongopass = config.Mongo.password;


var mongoose = require('mongoose');
var connectionstring = util.format('mongodb://%s:%s@%s:%d/%s', mongouser, mongopass, mongoip, mongoport, mongodb);


mongoose.connection.on('error', function (err) {
    logger.error(err);
});

mongoose.connection.on('disconnected', function () {
    logger.error('Could not connect to database');
});

mongoose.connection.once('open', function () {
    logger.info("Connected to db");
});

mongoose.connect(connectionstring);






