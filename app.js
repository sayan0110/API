const express = require('express');
const app = express();
const mongoose = require('mongoose');
const userRouter = require('../API/routes/user');
const videoRouter = require('../API/routes/video');
const commentRouter = require('../API/routes/comment');
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
require('dotenv').config();

// Type-1 of connecting with mongodb =====>
// mongoose.connect(process.env.MONGO_URI)
// .then(() => console.log('Connected to MongoDB'))
// .catch(err => console.error('Could not connect to MongoDB'));


// Type-2 of connecting with mongodb =====>
    const connectWithDB = async ()=>{
        try{
            const res = await mongoose.connect(process.env.MONGO_URI);
            console.log("conected with database");
        }
        catch(err){
            console.log("Failed to connect with database", err);
        }
    }
    connectWithDB();

    app.use(bodyParser.json());


    app.use(fileupload({
        useTempFiles: true,
        tempFileDir: './temp/'
    }));

     
    app.use("/users", userRouter);
    app.use("/videos", videoRouter);
    app.use("/comments", commentRouter);


module.exports = app;