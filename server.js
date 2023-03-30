// Import the database configuration module (presumably this sets up the database connection)
require('./config/db');

// Import the Express library and create an app instance
const app = require('express')();

// Define the port number for the server to listen on
const port = 3000;

// Import the UserRouter module, which presumably defines routes for user-related API endpoints
const UserRouter = require('./api/User');

// Import the json middleware from the express library and use it to parse incoming request bodies
const bodyParser = require('express').json;
app.use(bodyParser());

// Mount the UserRouter middleware at the '/user' path so it handles requests for user-related API endpoints
app.use('/user', UserRouter);

// Start the server listening on the specified port and log a message to the console when it starts
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
