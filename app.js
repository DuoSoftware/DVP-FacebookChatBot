var restify = require('restify');
var builder = require('botbuilder');
var jsonwebtoken = require('jsonwebtoken');
var config = require('config');
var validator = require('validator');
var util = require("util");
var moment  = require('moment');
var uuid = require('node-uuid');
var request = require('request');
var restify = require('restify');
var fs = require('fs');


var sockets = {};



var https_options = {
    ca: fs.readFileSync('/etc/ssl/fb/COMODORSADomainValidationSecureServerCA.crt'),
    key: fs.readFileSync('/etc/ssl/fb/SSL1.txt'),
    certificate: fs.readFileSync('/etc/ssl/fb/STAR_duoworld_com.crt')
};


var server = restify.createServer(https_options);
server.listen(process.env.port || process.env.PORT || 443, function () {
    console.log('%s listening to %s', server.name, server.url);
});


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




////////////////////agent card///////////////////////////////////////////////////////////////////////////


function createAnimationCard(session, name, avatar) {
    return new builder.ThumbnailCard(session)
        .title('Agent found')
        .subtitle(name)
        .text("Agents greeting can be added !!!!!!!!!!")
        .images([builder.CardImage.create(session, avatar)]);
};


function createCSATCard(session, name, avatar) {
    return new builder.ThumbnailCard(session)
        .title('customer satisfaction survey')
        .subtitle(name)
        .text("Are you satisfied with our service ?")
        .images([builder.CardImage.create(session, avatar)])
        .buttons([
            builder.CardAction.postBack(session, 'good', 'Satisfied'),
            builder.CardAction.postBack(session, 'bad', 'Not Satisfied')
        ]);
}



function CreateSubmission(session, requester, submitter, satisfaction,contact, cb){

    var token = util.format("Bearer %s",config.Host.token);
    if((config.Services && config.Services.csaturl && config.Services.csatport && config.Services.csatversion)) {


        //console.log("CreateSubmission start");
        var csatURL = util.format("http://%s/DVP/API/%s/CustomerSatisfaction/Submission/ByEngagement", config.Services.csaturl, config.Services.csatversion);
        if (validator.isIP(config.Services.csaturl))
            csatURL = util.format("http://%s:%d/DVP/API/%s/CustomerSatisfaction/Submission/ByEngagement", config.Services.csaturl, config.Services.csatport, config.Services.csatversion);

        var csatData =  {

            requester: requester,
            submitter: submitter,
            engagement: session,
            method:'chat',
            satisfaction: satisfaction,
            contact: contact


        };



        // logger.debug("Calling CSAT service URL %s", ticketURL);
        // logger.debug(csatData);

        request({
            method: "POST",
            url: csatURL,
            headers: {
                authorization: token,
                companyinfo: util.format("%d:%d", config.Host.tenant, config.Host.company)
            },
            json: csatData
        }, function (_error, _response, datax) {


            try {

                console.log(_response.body);

                if (!_error && _response && _response.statusCode == 200 && _response.body && _response.body.IsSuccess) {

                    cb(true, _response.body.Result);

                }else{

                    // logger.error("There is an error in  create csat for this session "+ session);

                    cb(false, undefined);


                }
            }
            catch (excep) {

                //logger.error("There is an error in  create csat for this session "+ session, excep);
                cb(false, undefined);

            }
        });
    }
}


