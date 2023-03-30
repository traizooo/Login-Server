// Import the Mongoose library
const mongoose = require('mongoose');

// Get the Schema constructor function from Mongoose
const Schema = mongoose.Schema;

// Define a new user schema using the Schema constructor function
const UserSchema = new Schema({
    name: String,       // Define a name field of type String
    email: String,      // Define an email field of type String
    userName: String,   // Define a username field of type String
    password: String,   // Define a password field of type String
    verified: Boolean   // Define a verified field of type Boolean
});

// Create a new Mongoose model for the user schema
const User = mongoose.model('User', UserSchema);

// Export the User model for use in other modules
module.exports = User;
