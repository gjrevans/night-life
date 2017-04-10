var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    models

var UserRoutes = function(appModels){
    models = appModels;
};

UserRoutes.prototype.register = function(req, res) {
    // Set the page breadcrumb
    req.breadcrumbs('Register', '/users/register');

    // Render the page
    res.render('users/register.html', {
        breadcrumbs: req.breadcrumbs(),
        page: { title: 'Register' },
        path: 'register'
    });
}

UserRoutes.prototype.createAccount = function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    // Validation
    req.checkBody('name', 'Name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors){
        req.flash("errorMessages", errors);
        res.render('users/register.html', {
            page: { title: 'Register' }
        });
    } else {
        var newUser = new models.user.User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        models.user.createUser(newUser, function(err, user){
            if(err) throw err;
        });

        req.flash('successMessages', 'You are now registered & can login!');
        res.redirect('login');
    }
}

UserRoutes.prototype.login = function(req, res) {
    // Set the page breadcrumb
    req.breadcrumbs('Login', '/users/login');

    // Render the page
    res.render('users/login.html', {
        breadcrumbs: req.breadcrumbs(),
        page: { title: 'Login' },
        path: 'login'
    });
}

UserRoutes.prototype.authenticate = function(req, res) {
    res.redirect('/');
}

UserRoutes.prototype.logout = function(req, res) {
    req.logout();
    req.flash('successMessages', 'Successfully logged out!');
    req.session.destroy();
    res.redirect('/');
}

UserRoutes.prototype.addGoing = function(req, res) {
    var location = req.body.locationId;
    var user = req.params.id;
    console.log('Hi there');
    console.log(location);
    console.log(user);
    if (location && user) {
        models.user.addGoing(user, location, function(err, user){
            if (err){
                return res.status(500).json({status: 500, error: true, message: err});
            }
            res.status(200).json({
                status: 200,
                error: false,
                message: "Success",
                model: 'user'
            });
        });
    } else {
        return res.status(404).json({status: 404, error: true, message: 'Bad Request'});
    }
}

UserRoutes.prototype.removeGoing = function(req, res) {
    var location = req.body.locationId;
    var user = req.params.id;

    if (location && user) {
        models.user.removeGoing(user, location, function(err, user){
            if (err){
                return res.status(500).json({status: 500, error: true, message: err});
            }
            res.status(200).json({
                status: 200,
                error: false,
                message: "Success",
                model: 'user'
            });
        });
    } else {
        return res.status(404).json({status: 404, error: true, message: 'Bad Request'});
    }
}

passport.use(new LocalStrategy(function(username, password, done) {
    models.user.getUserByUsername(username, function(err, user){
        if(err) throw err;
        if(!user) {
            return done(null, false, {message: 'Unknown User'});
        }

        models.user.comparePassword(password, user.password, function(err, isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid password'});
            }
        });
    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.user.getUserById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = UserRoutes;
