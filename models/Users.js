var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');

var UserSchema = mongoose.Schema({
   username:{
     type: String,
       index: true
   },
    password:{
       type:String
    }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
    console.log("I am in createUser");
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(newUser.password, salt, function(err, hash) {
            newUser.password = hash;
            console.log(newUser);
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function(username,callback){
    User.findOne({ username: username },callback);
};

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, function(err, isMatch){
        if(err) throw err;
        callback(null, isMatch);
    })
};

module.exports.getUserById = function(id, callback){
    User.findById(query,callback);
}