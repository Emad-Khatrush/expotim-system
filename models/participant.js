var mongoose = require("mongoose");

var participant = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
  company: {type: String, required: true},
  images: [
      {
        url: String,
        filename: String
      }
    ],
  brandName: {type: String, required: true},
  businessNumber: {type: String, required: true},
  companiesWorkedwith: {type: String, required: true},
  countriesParticipated: {type: String, required: true},
  personLanguages: {type: String, required: true},
  email: {type: String, required: true},
  firstName: {type: String, required: true},
  lastName: {type: String, required: true},
  companyAdress: {type: String, required: true},
  phone: {type: Number, required: true},
  city: {type: String, required: true},
  title: {type: String, required: true},
  interestedField: {type: String, required: true},
  date: {type: String, required: true},
  note: String,
  ableToEdit: { type: Boolean, default: true }
});

module.exports = mongoose.model("Participant", participant);
