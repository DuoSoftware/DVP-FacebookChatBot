module.exports = {


    TWITTER_KEY: 'dUTFwOCHWXpvuLSsgQ7zvOPRK',
    TWITTER_SECRET: 'KXDD9YRt58VddSTuYzvoGGGsNK5B5p9ElJ31WNLcZZkR4eVzp9',
    TWITTER_CALLBACK_URL: 'http://localhost:63342/DVP-AdminConsole/#/console/social/twitter',


    "DB": {
        "Type": "postgres",
        "User": "duo",
        "Password": "DuoS123",
        "Port": 5432,
        "Host": "localhost",
        "Database": "dvpdb"
    },


    "Redis": {
        "ip": "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123"

    },


    "Security": {
        "ip": "45.55.142.207",
        "port": 6389,
        "user": "duo",
        "password": "DuoS123"
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

        "ip": "104.236.197.119",
        "port": "4647"

    },


    "Services": {
        "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdWtpdGhhIiwianRpIjoiYWEzOGRmZWYtNDFhOC00MWUyLTgwMzktOTJjZTY0YjM4ZDFmIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE5MDIzODExMTgsInRlbmFudCI6LTEsImNvbXBhbnkiOi0xLCJzY29wZSI6W3sicmVzb3VyY2UiOiJhbGwiLCJhY3Rpb25zIjoiYWxsIn1dLCJpYXQiOjE0NzAzODExMTh9.Gmlu00Uj66Fzts-w6qEwNUz46XYGzE8wHUhAJOFtiRo",

        "messengerhost": "externalipmessagingservice.app.veery.cloud",//ardsliteservice.app.veery.cloud
        "messengerport": "3334",
        "messengerversion": "1.0.0.0",

        "facebookUrl": "https://graph.facebook.com/v2.8/"


    }


};
