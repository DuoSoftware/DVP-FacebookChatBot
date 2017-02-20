/**
 * Created by Waruna on 2/20/2017.
 */

var restify = require('restify');
var builder = require('botbuilder');
var jsonwebtoken = require('jsonwebtoken');
var config = require('config');
var validator = require('validator');
var util = require("util");
var moment  = require('moment');
var uuid = require('node-uuid');
var request = require('request');

var sockets = {};

var restify = require('restify');
var fs = require('fs');


var https_options = {
    ca: fs.readFileSync('/etc/ssl/fb/COMODORSADomainValidationSecureServerCA.crt'),
    key: fs.readFileSync('/etc/ssl/fb/SSL1.txt'),
    certificate: fs.readFileSync('/etc/ssl/fb/STAR_duoworld_com.crt')
};


var server = restify.createServer(https_options);

server.pre(restify.pre.userAgentConnection());
server.use(restify.bodyParser({mapParams: false}));
server.use(restify.queryParser());
server.use(restify.CORS());
server.use(restify.fullResponse());

server.get('/', function(req, res) {
    console.log("Server.........................");
    res.send('It works!');
});

server.get('/webhook', function(req, res) {
    console.log("Server Webhook......");
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
    console.log("Server Webhook...... > " +data);
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


server.listen(443, function () {
    console.log('%s listening at %s', server.name, server.url);
});
