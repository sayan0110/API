const express = require("express");
const router = express.Router();
const checkAuth = require("../middleware/checkAuth");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const Video = require("../models/Video");
require("dotenv").config();
const mongoose = require("mongoose");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

//upload videos and thumbail ======================================================>
router.post("/upload", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const user = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log("User: ", user);
    // console.log(req.body);
    // console.log(req.files.video);
    // console.log(req.files.thumbnail);

    const uploadedVideo = await cloudinary.uploader.upload(
      req.files.video.tempFilePath,
      { resource_type: "video" }
    );
    const uploadedThumbnail = await cloudinary.uploader.upload(
      req.files.thumbnail.tempFilePath
    );

    const newVideo = new Video({
      _id: new mongoose.Types.ObjectId(),
      title: req.body.title,
      description: req.body.description,
      user_id: user._id,
      videoUrl: uploadedVideo.url,
      videoId: uploadedVideo.public_id,
      thumbnailUrl: uploadedThumbnail.url,
      thumbnailId: uploadedThumbnail.public_id,
      catagory: req.body.category,
      tags: req.body.tags.split(","),
    });
    await newVideo.save();
    res.status(200).json({
      message: "Video uploaded successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
    });
  }
});

//update videio's thumbnail, description,  tags, catagory =======================================================>
router.put("/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, process.env.JWT_SECRET);
    const video = await Video.findOne({ videoId: req.params.videoId });

    if (verifiedUser._id == video.user_id) {
      if (req.files) {
        await cloudinary.uploader.destroy(video.thumbnailId);
        const updatedThumbnail = await cloudinary.uploader.upload(
          req.files.thumbnail.tempFilePath
        );
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          catagory: req.body.category,
          tags: req.body.tags.split(","),
          thumbnailUrl: updatedThumbnail.secure_url,
          thumbnailId: updatedThumbnail.public_id,
        };

        const updatedVideoDetails = await Video.findOneAndUpdate(
          { videoId: req.params.videoId },
          updatedData,
          { new: true }
        );
        res.status(200).json({
          message: updatedVideoDetails,
        });
      } else {
        const updatedData = {
          title: req.body.title,
          description: req.body.description,
          catagory: req.body.category,
          tags: req.body.tags.split(","),
        };

        const updatedVideoDetails = await Video.findOneAndUpdate(
          { videoId: req.params.videoId },
          updatedData,
          { new: true }
        );
        res.status(200).json({
          message: updatedVideoDetails,
        });
      }

      await video.save();
      res.status(200).json({
        message: "Video updated successfully",
      });
    } else {
      res.status(401).json({
        message: "Unauthorized user",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//delete video =======================================================>
router.delete("/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, process.env.JWT_SECRET);

    // console.log(verifiedUser)
    const video = await Video.findOne({ videoId: req.params.videoId });
    if (verifiedUser._id == video.user_id) {
      await cloudinary.uploader.destroy(video.thumbnailId);
      await cloudinary.uploader.destroy(video.videoId);
      await video.deleteOne({ videoId: req.params.videoId });
      res.status(200).json({
        message: "Video deleted successfully",
      });
    } else {
      res.status(401).json({
        message: "Unauthorized user",
      });
    }
  } catch (err) {
    console.log(err);
  }
});

//like video =======================================================>
router.put("/like/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, process.env.JWT_SECRET);
    const video = await Video.findOne({ videoId: req.params.videoId });

    if (video.likedBy.includes(verifiedUser._id)) {
      return res.status(500).json({
        error: "Already Liked",
      });
    }
    if (video.dislikedBy.includes(verifiedUser._id)) {
      video.dislikes -= 1;
      // video.dislikedBy.remove(verifiedUser._id);
      video.dislikedBy = video.dislikedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }
    video.likes += 1;
    video.likedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({
      message: "Video liked successfully",
    });
  } catch (err) {
    console.log(err);
  }
});

//dislike video =======================================================>
router.put("/dislike/:videoId", checkAuth, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const verifiedUser = await jwt.verify(token, process.env.JWT_SECRET);
    const video = await Video.findOne({ videoId: req.params.videoId });

    if (video.dislikedBy.includes(verifiedUser._id)) {
      return res.status(500).json({
        error: "Already Disliked",
      });
    }

    if (video.likedBy.includes(verifiedUser._id)) {
      video.likes -= 1;
      // video.dislikedBy.remove(verifiedUser._id);
      video.likedBy = video.likedBy.filter(
        (userId) => userId.toString() != verifiedUser._id
      );
    }
    video.dislikes += 1;
    video.dislikedBy.push(verifiedUser._id);
    await video.save();
    res.status(200).json({
      message: "Video disliked successfully",
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
