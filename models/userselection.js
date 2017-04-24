var mongoose = require('mongoose');

var userselectionSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: false
    },
    rating: {
        type: String,
        required: false
    },
    isPlaceOpen: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: true
    }


});

var userselection = mongoose.model('userselection', userselectionSchema);

module.exports = userselection;
