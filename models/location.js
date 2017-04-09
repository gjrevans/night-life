var yelp = require("yelp-fusion");

var LocationModel = function(){};

LocationModel.prototype.getToken = function(callback) {
    yelp.accessToken(process.env.YELP_ID, process.env.YELP_SECRET)
    .then(response => {
        callback(null, response.jsonBody.access_token);
    }).catch(error => {
        callback(error);
    });
}

LocationModel.prototype.locationSearch = function(options, token, callback){
    var client = yelp.client(token);

    client.search(options)
    .then(response => {
        callback(null, response.jsonBody);
    }).catch(error => {
        callback(error);
    });
}

module.exports = LocationModel;
