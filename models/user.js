var mongoose    = require('mongoose');
var bcrypt      = require('bcryptjs');
var validator   = require('validator');
var User;

var UserModel = function(){
    User = this.User = mongoose.model('User', UserSchema);
};

var UserSchema = mongoose.Schema({
    username: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    email: {
        type: String
    },
    name: {
        type: String
    }
    locations: [{
        type: String
    }]
});

UserModel.prototype.createUser = function(newUser, callback){
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

UserModel.prototype.getUserByUsername = function(username, callback){
    var query = { username: username }
    User.findOne(query, callback);
}

UserModel.prototype.getUserById = function(id, callback){
    // Make sure we're passing a mongo id
    if(!id || !validator.isMongoId(id)){
        return callback("invalidId", false);
    }
    User.findById(id, callback);
}

UserModel.prototype.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
        if(err) throw err;
        callback(null, isMatch);
    });
}

module.exports = UserModel;
