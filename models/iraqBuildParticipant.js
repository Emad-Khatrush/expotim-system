var mongoose = require("mongoose");

var iraqBuildParticipant = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: "user"},
  company: {type: String, required: true},
  images: [
      {
        url: String,
        filename: String
      }
    ],
  brandName: {type: String, required: true},
  businessNumber: Number,
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
  interestedField: {type: Array, required: true},
  otherInterested: String,
  date: {type: String, required: true},
  note: String,
  purchasingRole: {type: String, required: true} ,
  companyMainActivity: {type: String, required: true},
  ableToEdit: { type: Boolean, default: true }
});

module.exports = mongoose.model("iraqBuildParticipant", iraqBuildParticipant);
