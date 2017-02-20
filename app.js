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

var fb = require('./Services/FacebookClient');

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

var messengerURL = util.format("http://%s", config.Services.messengerhost);
if (validator.isIP(config.Services.messengerhost))
    messengerURL = util.format("http://%s:%d", config.Services.messengerhost, config.Services.messengerport);


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
    console.log("Server Webhook...... > " +JSON.stringify(data));
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

    if(!sockets[event.sender.id]) {
        var socket = require('socket.io-client')(messengerURL, {forceNew: true});
        sockets[event.sender.id] = socket;
        socket.on('connect', function () {

            var session_id = uuid.v1();
            //session.userData.session_id = session_id;

            var channel = "FACEBOOKMESSENGER";

            var jwt = jsonwebtoken.sign({
                session_id: session_id,
                iss: config.Host.iss,
                iat: moment().add(1, 'days').unix(),
                company: config.Host.company,
                tenant: config.Host.tenant,
                contact: event.sender.id,
                channel: channel,
                jti: event.sender.id,
                attributes: ["60"],
                priority: "0",
                name: event.sender.id

            }, config.Host.secret);

            socket
                .emit('authenticate', {token: jwt}) //send the jwt
                .on('authenticated', function () {
                    //do other things

                    fb.SendTextMessage(event.sender.id,"Please waiting for human agent to take over");

                    socket.emit("message", {
                        message: event.message.text,
                        type:"text"
                    });


                    function retryAgent () {
                        socket.emit("retryagent");
                    }
                    var retryObj = setInterval(retryAgent, 30000);

                    socket.on('agent', function(data){
                        if(retryObj) {
                            clearInterval(retryObj);
                        }
                        console.log(data);
                        var card = createAnimationCard(session,data.name, data.avatar);

                        session.userData.agent = data;

                        var msg = new builder.Message(session).addAttachment(card);
                        session.send(msg);
                    });



                    socket.on('typing', function (data) {

                        session.sendTyping();
                    });

                    socket.on('typingstoped', function (data) {

                    });

                    socket.on('seen', function (data) {

                    });

                    socket.on("message", function(data){

                        session.send(data.message);
                    });

                    socket.on('existingagent', function(data){

                        if(retryObj){

                            clearInterval(retryObj);
                        }

                        if(data && data.name && data.avatar) {
                            console.log(data);
                            var card = createAnimationCard(session, data.name, data.avatar);
                            var msg = new builder.Message(session).addAttachment(card);
                            session.send(msg);
                        }

                    });


                    socket.on('left', function(data){

                        session.send("Agent left the chat");


                        if(sockets[event.sender.id]) {
                            session.beginDialog('/csat');
                            delete sockets[event.sender.id];
                        }
                        if(retryObj){

                            clearInterval(retryObj);
                        }
                        socket.disconnect();

                    });

                    socket.on('disconnect', function () {

                        //session.send("Agent left the chat due to technical issue...");

                        if(sockets[event.sender.id]) {
                            //session.endConversation();
                            delete sockets[event.sender.id];
                        }
                        if(retryObj){

                            clearInterval(retryObj);
                        }

                    });

                })
                .on('unauthorized', function (msg) {
                    console.log("unauthorized: " + JSON.stringify(msg.data));
                    delete sockets[event.sender.id];
                    //throw new Error(msg.data.type);
                })

        });

    }else{

        //session.send("Please waiting for human agent to take over  !!!!!");

        sockets[event.sender.id].emit("message", {
            message: session.message.text,
            type:"text" ,
        });

        //console.log("Another user interacted "+session.message.text);

    }

}


server.listen(443, function () {
    console.log('%s listening at %s', server.name, server.url);
});
