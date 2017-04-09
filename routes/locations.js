var models;

var LocationRoutes = function(appModels){
    models = appModels;
};

LocationRoutes.prototype.index = function(req, res) {
    res.redirect('locations/search');
}

LocationRoutes.prototype.search = function(req, res) {
    // Define our options
    var options = {};

    // TODO: In the future allow users to set categories
    options.categories = 'bars';
    options.location = req.query.q;
    options.limit = parseInt(req.query.limit) || 10;
    options.offset = parseInt(req.query.offset) || 0;

    // Create our default locations object
    var locations = [];
    var total = 0;

    if(options.location) {
        if(!req.session.token){
            models.location.getToken(function(err, token){
                if(err) throw err;

                // Get the locations and set the session token for future requests
                requestForLocations(token);
                req.session.token = token;
                console.log('Had to get a new token!');
            });
        } else {
            requestForLocations(req.session.token);
        }

        // Get Locations from the yelp server
        function requestForLocations(token){
            models.location.locationSearch(options, token, function(err, foundLocations){
                if(err) throw err;

                total = foundLocations.total;
                render(foundLocations.businesses);
            });
        }
    } else {
        render(locations);
    }

    // Render locations to the view
    function render(locations){
        res.render('locations/index.html', {
            breadcrumbs: req.breadcrumbs(),
            page: {title: 'Search for Bars'},
            options,
            locations,
            total
        });
    }
}

module.exports = LocationRoutes;
