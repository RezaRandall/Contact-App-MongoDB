const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");

const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 3000;

// Konfigurasi Method Override
// override with POST having ?_method=DELETE
app.use(methodOverride("_method"));

// SETUP EJS
app.set("view engine", "ejs"); // GUNAKAN EJS
app.use(expressLayouts); // THIRD PARTY MIDDLEWARE
app.use(express.static("public")); // BUILD-IN MIDDLEWARE
app.use(express.urlencoded({ extended: true })); // BUILD-IN MIDDLEWARE

// KONFIGURASI FLASH
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// HALAMAN HOME
app.get("/", (req, res) => {
  const mahasiswa = [
    {
      nama: "Dwi Reza Irawan",
      email: "dwi@gmail.com",
    },
    {
      nama: "Naomi",
      email: "Naomi@gmail.com",
    },
    {
      nama: "Edelways",
      email: "Edelways@gmail.com",
    },
  ];
  res.render("index", {
    layout: "layouts/main-layout",
    nama: "Reza",
    mahasiswa,
    title: "Halaman Home",
  });
});

// HALAMAN ABOUT
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "Halaman About",
  });
});

// HALAMAN CONTACT
app.get("/contact", async (req, res) => {
  // Menjalankkan tanpa async await
  //   Contact.find().then((contact) => {
  //     res.send(contact);
  //   });
  const contacts = await Contact.find();
  // console.log(contacts);
  res.render("contact", {
    layout: "layouts/main-layout",
    title: "Halaman Contact",
    contacts,
    msg: req.flash("msg"),
  });
});

// Halaman Form Tambah Data
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add New Contact Form",
    layout: "layouts/main-layout",
  });
});

// PROCESS TAMBAH DATA CONTACT
app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const duplicate = await Contact.findOne({ name: value });
      if (duplicate) {
        throw new Error("Contact name already use!");
      }
      return true;
    }),
    check("email", "Email format is not valid!").isEmail(),
    check("noHp", "Mobile phone number is not valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Add Contact Form",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      Contact.insertMany(req.body, (error, result) => {
        // kirim flash message
        req.flash("msg", "Contact data has been added");
        res.redirect("/contact");
      });
    }
  }
);

// PROCESS DELETE CONTACT
// app.get("/contact/delete/:name", async (req, res) => {
//   const contact = await Contact.findOne({ name: req.params.name });
//   // jika kontak tidak ada
//   if (!contact) {
//     res.status(404);
//     res.send("<h1>404</h1>");
//   } else {
//     Contact.deleteOne({ _id: contact._id }).then((result) => {
//       // flash message
//       req.flash("msg", "Data contact has been deleted");
//       res.redirect("/contact");
//     });
//   }
// });

// PROCESS DELETE CONTACT yg lebih rapi
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ name: req.body.name }).then((result) => {
    // flash message
    req.flash("msg", "Data contact has been deleted");
    res.redirect("/contact");
  });
});

// HALAMAN FORM EDIT DATA CONTACT
app.get("/contact/edit/:name", async (req, res) => {
  const contact = await Contact.findOne({ name: req.params.name });

  res.render("edit-contact", {
    title: "Edit Data Contact Form",
    layout: "layouts/main-layout",
    contact,
  });
});

// PROSES UBAH DATA
app.put(
  "/contact",
  [
    body("name").custom(async (value, { req }) => {
      const duplicate = await Contact.findOne({ name: value });
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Contact name already use!");
      }
      return true;
    }),
    check("email", "Email format is not valid!").isEmail(),
    check("noHp", "Mobile phone number is not valid").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Edit Contact Form",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            noHp: req.body.noHp,
          },
        }
      ).then((result) => {
        // kirim flash message
        req.flash("msg", "Data Contact has been updated");
        res.redirect("/contact");
      });
    }
  }
);

// GET DETAIL CONTACT BY NAME
app.get("/contact/:name", async (req, res) => {
  const contact = await Contact.findOne({ name: req.params.name });

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail Contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`Mongo contact app | listening at http://localhost:${port}`);
});
