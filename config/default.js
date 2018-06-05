module.exports = {


    TWITTER_KEY: '',
    TWITTER_SECRET: '',
    TWITTER_CALLBACK_URL: 'http://localhost:63342/DVP-AdminConsole/#/console/social/twitter',


    "DB": {
        "Type": "postgres",
        "User": "",
        "Password": "",
        "Port": 5432,
        "Host": "localhost",
        "Database": ""
    },


    "Redis": {
        "ip": "",
        "port": 6389,
        "user": "",
        "password": ""

    },


    "Security": {
        "ip": "",
        "port": 6389,
        "user": "",
        "password": ""
    },


    "Host": {
        "ServerType": "SOCIALMEDIACONNECTOR",
        "CallbackOption": "GET",
        "RequestType": "CALL",
        "ServerID": 2,
        "resource": "cluster",
        "vdomain": "localhost",
        "domain": "localhost",
        "port": "4647",
        "version": "1.0.0.0",
        "iss": "singer",
        "secret": "abcdefgh"
    },


    "LBServer": {

        "ip": "",
        "port": "4647"

    },


    "Services": {
        "accessToken": "",

        "messengerhost": "",//ardsliteservice.app.veery.cloud
        "messengerport": "3334",
        "messengerversion": "1.0.0.0",

        "facebookUrl": "https://graph.facebook.com/v2.8/"


    }


};
