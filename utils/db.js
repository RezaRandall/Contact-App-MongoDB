const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/rrdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// // MENAMBAH 1 DATA
// const contact1 = new Contact({
//   name: "dian",
//   noHp: "081233900066",
//   email: "dian@gmail.com",
// });

// // SIMPAN KE COLLECTION
// contact1.save().then((contact) => console.log(contact));
