const express = require("express");
const Router = express.Router();
const fileupload = require("express-fileupload");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
const User = require("../models/User");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

Router.post("/signup", async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (User.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    const hasCode = await bcrypt.hash(req.body.password, 10);
    const uploadedImage = await cloudinary.uploader.upload(
      req.files.logo.tempFilePath
    );

    const newUser = new User({
      _id: new mongoose.Types.ObjectId(),
      channelName: req.body.channelName,
      email: req.body.email,
      phone: req.body.phone,
      password: hasCode,
      logoUrl: uploadedImage.url,
      logoId: uploadedImage.public_id,
      subscribers: 0,
    });
    const user = await newUser.save();
    res.status(200).json({ newUser: user });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

Router.post("/login", async (req, res) => {
  try {
    console.log(req.body);
    const users = await User.find({ email: req.body.email });
    if (users.length == 0) {
      return res.status(500).json({
        error: "email is not registered",
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, users[0].password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({
        error: "Wrong Password",
      });
    }

    const token = jwt.sign(
      {
        _id: users[0].id,
        channelName: users[0].channelName,
        email: users[0].email,
        phone: users[0].phone,
        logoId: users[0].logoId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "365d" }
    );

    res.status(200).json({
      user: users[0],
      token: token,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "something is wrong",
    });
  }
});


module.exports = Router;
