// Load environment variables from a .env file
require('dotenv').config();

// Import the Mongoose library
const mongoose = require("mongoose");

// Log the MONGODB_URI environment variable to the console
console.log(process.env.MONGODB_URI);

// Connect to the MongoDB database using the MONGODB_URI environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // Use the new URL parser
    useUnifiedTopology: true // Use the new Server Discover and Monitoring engine
})
.then(() => {
    console.log("DB connected"); // Log a success message if the connection is successful
})
.catch((err) => console.log(err)); // Log an error message if the connection fails
