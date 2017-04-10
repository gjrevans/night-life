var models;

var LocationRoutes = function(appModels){
    models = appModels;
};

LocationRoutes.prototype.index = function(req, res) {
    // If the user has searched for something previously, then lets use that for our search
    if(req.session.lastSearchedLocation){
        return res.redirect('locations/search?limit=10&offset=0&q=' + req.session.lastSearchedLocation);
    }
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
        // Set the users last location
        req.session.lastSearchedLocation = options.location;

        // Get a token if no token
        if(!req.session.token){
            models.location.getToken(function(err, token){
                if(err) throw err;

                // Get the locations and set the session token for future requests
                requestForLocations(token);
                req.session.token = token;
            });
        } else {
            requestForLocations(req.session.token);
        }

        // Get Locations from the yelp server
        function requestForLocations(token){
            models.location.locationSearch(options, token, function(err, foundLocations){
                if(err) throw err;

                // Create variables that will be passed to the view
                total = foundLocations.total;
                locations = foundLocations.businesses;

                // Map user locations to the requested locations
                // Allow us to show if the user is going to a certain location
                if(req.user){
                    locations.forEach(function(location, index) {
                        locations[index].isGoing = false;

                        if (checkIfGoing(location.id)) {
                            locations[index].isGoing = true;
                        }
                    });
                }
                render(locations);
            });
        }
    } else {
        render(locations);
    }

    function checkIfGoing(id){
        var userLocations = req.user.locations;
        for(var i = 0; i < userLocations.length; i++) {
            if (id === userLocations[i]) {
                return true;
            }
        }
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
