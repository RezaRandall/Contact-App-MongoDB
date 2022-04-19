const mongoose = require("mongoose");

// MEMBUAT SCHEMA
const Contact = mongoose.model("Contact", {
  name: {
    type: String,
    required: true,
  },
  noHp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = Contact;
