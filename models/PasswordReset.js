// Import the Mongoose library
const mongoose = require('mongoose');

// Get the Schema constructor function from Mongoose
const Schema = mongoose.Schema;

// Define a new user password reset schema using the Schema constructor function
const PasswordResetSchema = new Schema({
    userId: String,         // Define a userId field of type String
    resetString: String,   // Define a uniqueString field of type String
    createdAt: Date,        // Define a createdAt field of type Date
    expiresAt: Date,        // Define an expiresAt field of type Date
});

// Create a new Mongoose model for the user password reset schema
const PasswordReset = mongoose.model('PasswordReset', PasswordResetSchema);

// Export the UserVerification model for use in other modules
module.exports = PasswordReset;
