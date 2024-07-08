// const { type } = require('@testing-library/user-event/dist/type');
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
     title: {
        type: String,
        required: true
     },
     description: {
        type: String,
        required: true
     },
     media: {
        type: String,
        required: true
     },
     owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
     }

}, {timestamps: true})

const Video = mongoose.model('Video', videoSchema);

module.exports = Video;