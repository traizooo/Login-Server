require('dotenv').config();
const mongoose = require("mongoose");

console.log(process.env.MONGODB_URL);

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true, 
    useUnifiedTopology: true
})
.then(() => {
    console.log("DB connected");
})
.catch((err) => console.log(err));
