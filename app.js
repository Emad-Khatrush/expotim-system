if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}

var express               = require("express"),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    session               = require("express-session"),
    passport              = require("passport"),
    localStrategy         = require("passport-local").Strategy,
    passportLocalMongoose = require("passport-local-mongoose"),
    flash                 = require("connect-flash"),
    User                  = require("./models/user"),
    Participant           = require("./models/participant"),
    methodOverride        = require('method-override'),
    excel                 = require("exceljs"),
    nodemailer            = require('nodemailer'),
    async                 = require("async"),
    multer                = require('multer');
const { storage }         = require('./cloudinary');
var upload                = multer({ storage });

var app = express();
// setup packages
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(methodOverride('_method'));
app.use(flash());

// connect mongoose
mongoose.connect("mongodb://localhost/data-system",
{ useNewUrlParser: true,
  useUnifiedTopology: true }, function(){
    console.log("mongodb connected");
  });

// passport configurations
app.use(session({
    secret: "expotim",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(async function(req,res,next){
  await User.find({title: "koordinator"}, function(err,koorMembers){
    res.locals.koorMembers = koorMembers;
  })
  await User.find({title: "team-member"}, function(err,teamMembers){
    res.locals.teamMembers = teamMembers;
  })

  res.locals.currentUser = req.user;
  res.locals.error       = req.flash("error");
  res.locals.success     = req.flash("success");
  next();
});

//-------------------------------
//            Routes
//-------------------------------
// Login Route: GET
app.get("/", function(req,res){
  res.redirect("/login");
})
app.get("/login", function(req,res){
  let todayDate = new Date().toLocaleDateString('tr-TR');

  // let firstday = new Date(todayDate.setDate(first)).toUTCString();
  // let lastday = new Date(todayDate.setDate(last)).toUTCString();
  // let firstDayMonth = new Date(todayDate.setDate(1));
  // let lastDayMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0)
  // var userData = new User({
  //   username: "emadkhatrush@hotmail.com",
  //   firstName: "emad",
  //   lastName: "khatrush",
  //   title: "req.body.position",
  //   phone: 54656,
  //   address: "req.body.adress",
  //   city: "req.body.city",
  //   status: "req.body.status",
  //   generelField: "req.body.generelField",
  //   isAdmin: true
  // });
  // User.register(userData, "123456", function(err, user){
  //   if (err) {
  //     console.log(err);
  //   }
  // })


  // var personData = new Participant({
  //   company: "emadkhatrush@hotmail.com",
  //   email: "emadkhatrush@hotmail.com",
  //   firstName: "emadkhatrush@hotmail.com",
  //   lastName: "emadkhatrush@hotmail.com",
  //   companyAdress: "emadkhatrush@hotmail.com",
  //   phone: 232332,
  //   city: "emadkhatrush@hotmail.com",
  //   title: "emadkhatrush@hotmail.com",
  //   interestedField: "emadkhatrush@hotmail.com",
  //   date: new Date().toLocaleDateString('tr-TR'),
  //   note: "emadkhatrush@hotmail.com"
  // })
  // personData.save(function(err, data){
  //   if (err) {
  //     req.flash("error", err.message)
  //     res.redirect("/dashboard/add-data");
  //   }else {
  //     req.flash("success", "Data added successfully")
  //     res.redirect("/dashboard/add-data");
  //   }
  // });
  res.render("./Login/login");
})
// Login Route: POST
app.post("/login",
passport.authenticate("local",{
  failureRedirect: "/login",
  failureFlash: true
}),function(req,res){
  req.flash("success", "Wellcome " + req.user.firstName);
  res.redirect("/dashboard");
})
// logout route
app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/login");
});

// dashboard Route
app.get("/dashboard",isLogin ,function(req,res){
  res.render("./dashboard/dashboard");
})
// Add Data Route: GET
app.get("/dashboard/add-data", isLogin,function(req,res){
  res.render("./dashboard/add-data");
})


// Add Data Route: POST
app.post("/dashboard/add-data", upload.array("image"), async function(req,res){
  const images = req.files.map(file => ({ url: file.path, filename: file.filename }));
  console.log(req.body, req.files);
  var personData = new Participant({
    user: req.user,
    company: req.body.company,
    email: req.body.email,
    brandName: req.body.brandName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    companyAdress: req.body.companyAdress,
    companiesWorkedwith: req.body.companiesWorkedWith,
    countriesParticipated: req.body.countriesParticipated,
    personLanguages: req.body.personLanguages,
    phone: req.body.phone,
    businessNumber: req.body.businessNumber,
    city: req.body.city,
    title: req.body.title,
    interestedField: req.body.interestedField,
    date: new Date().toLocaleDateString('tr-TR'),
    note: req.body.note
  })
  personData.images = images;
  await personData.save(function(err, data){
    if (err) {
      req.flash("error", err.message)
      res.redirect("/dashboard/add-data");
    }else {
      req.flash("success", "Data added successfully")
      res.redirect("/dashboard/add-data");
    }
  });
})
// My Reports Route: GET
app.get("/dashboard/myreports", isLogin,function(req,res){
  if (req.user.isAdmin) {
    Participant.find({}, function(err, fullData){
      if (err) {
        req.flash("error", err.message);
        res.redirect("back")
      }else {
        var todayDate = new Date().toLocaleDateString('tr-TR');
        Participant.find({date: todayDate}, function(err, dailyData){
          if (err) {
            req.flash("error", err.message);
            res.redirect("back");
          }else {
            res.render("./dashboard/myReports",
            { fullData: fullData,
              dailyData: dailyData,
              todayDate: todayDate,
              dailyDataLength: dailyData.length,
              fullDataLength: fullData.length});
          }
        })
      }
    })
  }else{
    Participant.find({user: req.user}, function(err, fullData){
      if (err) {
        console.log(err);
        res.redirect("back")
      }else {
        var todayDate = new Date().toLocaleDateString('tr-TR');
        Participant.find({user: req.user, date: todayDate}, function(err, dailyData){
          if (err) {
            console.log(err);
            res.redirect("back")
          }else {
            res.render("./dashboard/myReports",
            { fullData: fullData,
              dailyData: dailyData,
              todayDate: todayDate,
              dailyDataLength: dailyData.length,
              fullDataLength: fullData.length});
          }
        })
      }
    })
  }
})
// display report images: GET
app.get("/dashboard/image/:id",isLogin ,function(req,res){
  var participantId = req.params.id;
  Participant.findById(participantId, function(err, participant){
    if(err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("back");
    }else{
      res.render("./dashboard/viewImages", {participant: participant });
    }
  });
});
// display report images: GET
app.get("/dashboard/personalImage/:id",isLogin ,function(req,res){
  var userId = req.params.id;
  User.findById(userId, function(err, user){
    if(err) {
      req.flash("error", err.message);
      return res.redirect("back");
    }else{
      res.render("./dashboard/viewPersonalImage", {user: user });
    }
  });
});
// Contact Route: Get
app.get("/dashboard/contact", isLogin,function(req,res){
  if (!req.user.isAdmin) {
    res.render("./dashboard/contact");
  }else {
    req.flash("error", "You dont have the permissions");
    res.redirect("/dashboard");
  }
});
// Contact Route: POST
app.post("/dashboard/contact", isLogin,function(req,res){
  if (!req.user.isAdmin) {
    var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: 'qwe.emad@hotmail.com',
      pass: 'Naruto357&$'
      }
    });

    var mailOptions = {
      from: 'qwe.emad@hotmail.com',
      to: 'medokhatrush@gmail.com',
      subject: req.body.subject,
      html: `<h3> Message from ${req.user.firstName} ${req.user.lastName}</h3> <br> <p> ${req.body.note} <h3>Contact Info: ${req.user.username} </h3></p>`
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        req.flash("error", error.message);
        res.redirect("/dashboard/contact");
      } else {
        console.log('Email sent: ' + info.response);
        req.flash("success", "Message sent successfully");
        res.redirect("/dashboard/contact");
      }
    });
      }else {
        req.flash("error", "You dont have the permissions");
        res.redirect("/dashboard");
      }
});
// Change Password: Get
app.get("/dashboard/changePassword", isLogin, function(req,res){
  res.render("./dashboard/changePassword");
});
// Change Password: post
app.post("/dashboard/changePassword", isLogin, function(req,res){
  if (req.body.password === req.body.confirm) {
    async.waterfall([
      function(done) {
        User.findOne({username: req.user.username}, function(err,user){
        if (err) {
          req.flash("error", err.message);
          res.redirect("/dashboard");
        }
        user.setPassword(req.body.password, function(err){
          user.save(function(err) {
            if (err) {
              req.flash("error", err.message);
              res.redirect("/dashboard");
            }
            req.login(user, function(err) {
              if (err) {
                req.flash("error", err.message);
                res.redirect("/dashboard");
              }
              done(err, user);
            });
          });
        })
        req.flash("success", "Password changed successfully");
        res.redirect("/dashboard/changePassword");
      });
      }
    ])
  }else {
    req.flash("error", "Passwords do not match");
    res.redirect("/dashboard/changePassword");
  }
});

//-------------------------------
//            Admin Routes
//-------------------------------
// Insert Member Route: GET
app.get("/dashboard/insert-member",isLogin,function(req,res){
  if (req.user.isAdmin) {
    res.render("./dashboard/insert-member");
  }else {
    req.flash("error", "You dont have the admin permissions")
    res.redirect("/dashboard");
  }
});

// Insert Member Route: POST
app.post("/dashboard/insert-member",upload.single("image"),async function(req,res){
  if (req.user.isAdmin) {
    console.log(req.body,req.file);
    const image ={
      url: req.file.path,
      filename: req.file.filename
    }
    var userData = new User({
      username: req.body.username,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      title: req.body.position,
      phone: req.body.phone,
      address: req.body.adress,
      city: req.body.city,
      status: req.body.status,
      generelField: req.body.generelField
    });
    userData.image = image;
     await User.register(userData, req.body.password, function(err, user){
      if (err) {
        req.flash("error", err.message);
        return res.redirect("/dashboard/insert-member");
      }
        req.flash("success", "Member added successfully");
        res.redirect("/dashboard/insert-member");
    })
  }else {
    req.flash("error", "You dont have the admin permissions")
    return res.redirect("/dashboard");
  }
});
// Team Route: GET
app.get("/dashboard/team/:id", isLogin,(req, res) => {
  if (req.user.isAdmin) {
    var employeeId = req.params.id;
    User.findById(employeeId, function(err, employee){
      if (err) {
        req.flash("error", err.message);
        return req.redirect("back");
      }
      Participant.find({user: employee}, function(err, fullData){
        if (err) {
          req.flash("error", err.message);
          return req.redirect("back");
        }
        var todayDate = new Date().toLocaleDateString('tr-TR');
        Participant.find({user: employee, date: todayDate}, function(err, dailyData){
          if (err) {
            req.flash("error", err.message);
            return req.redirect("back");
          }
          res.render("./dashboard/employeeReport",
          {user: employee,
           fullData: fullData,
           dailyData: dailyData,
           todayDate: todayDate,
           dailyDataLength: dailyData.length,
           fullDataLength: fullData.length});
        });
      });
    });
  }else {
    req.flash("error", "You dont have the admin permissions")
    return res.redirect("/dashboard");
  }
});
// Team Edit Route: GET
app.get("/dashboard/team/:id/edit", isLogin,function(req,res){
  if (req.user.isAdmin) {
    var employeeId = req.params.id;
    User.findById(employeeId, function(err, employee){
      if (err) {
        req.flash("error", err.message);
        return req.redirect("back");
      }
      res.render("./dashboard/editEmployeeForm", {user: employee});
    });
  }else {
    req.flash("error", "You dont have the admin permissions")
    return res.redirect("/dashboard");
  }
});
// Team Edit Route: Edit
app.put("/dashboard/team/:id",function(req,res){
  if (req.user.isAdmin) {
    var employeeId = req.params.id;
    User.findByIdAndUpdate(employeeId, req.body.user,function(err, updatedUser){
      if (err) {
        req.flash("error", err.message);
        return req.redirect("back");
      }
      req.flash("success", "Data Updated successfully");
      res.redirect("/dashboard/team/" + employeeId);
    });
  }else {
    req.flash("error", "You dont have the admin permissions")
    return res.redirect("/dashboard");
  }
});
// Excel Export Route: GET
app.get('/dashboard/download/:typeData/excelsheet',isLogin ,async function(req, res, next){
  if (req.user.isAdmin) {
    let participants;
    if (req.params.typeData === "fullData") {
      console.log("export fullData");
      participants = await Participant.find({});
    }else if (req.params.typeData === "dailyData") {
      var todayDate = new Date().toLocaleDateString('tr-TR');
      participants = await Participant.find({date: todayDate});
    }else {
      req.flash("error", "You cant export this type of format");
      return res.redirect("back");
    }
    var workbook = new excel.Workbook();
    var worksheet = workbook.addWorksheet("Participants");

    worksheet.columns = [
      { header: "Id", key: "count", width: 5 },
      { header: "Company Name", key: "company", width: 20 },
      { header: "Brand Name", key: "brandName", width: 20 },
      { header: "First Name", key: "firstName", width: 20 },
      { header: "Last Name", key: "lastName", width: 20 },
      { header: "Email", key: "email", width: 30 },
      { header: "Company Adress", key: "companyAdress", width: 30 },
      { header: "Phone Number", key: "phone", width: 20 },
      { header: "Business Number", key: "businessNumber", width: 20 },
      { header: "Which Companies They Work with", key: "companiesWorkedwith", width: 20 },
      { header: "Which Countries Were/Will Participating In The Exhibitions", key: "countriesParticipated", width: 20 },
      { header: "Which Languages The Person Known", key: "personLanguages", width: 20 },
      { header: "Title", key: "title", width: 25 },
      { header: "Which Products/Sub Sectors He Is Interested With", key: "interestedField", width: 25 },
      { header: "Created Date", key: "date", width: 15 },
      { header: "Note", key: "note", width: 25 },
      { header: "Founder", key: "founder", width: 25 }
    ];
    const users        = await User.find({});
    let count = 1;
    participants.forEach(function(participant){
      users.forEach(function(userData){
        if(JSON.stringify(participant.user) === JSON.stringify(userData._id)) {
          participant.count = count;
          participant.founder = userData.firstName + " " + userData.lastName;
          worksheet.addRow(participant);
          count += 1;
        }
      });
      if (!participant.user) {
        participant.count = count;
        participant.founder = "";
        worksheet.addRow(participant);
        count += 1;
      }
    });

  res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=" + "participants.xlsx"
  );

        workbook.xlsx.write(res)
        .then(function () {
        res.status(200).end();
        });
  }else {
    req.flash("error", "You dont have the admin permissions")
    return res.redirect("/dashboard");
  }
});

function isLogin(req, res, next) {
  if(req.isAuthenticated())
  {
    return next();
  }
  res.redirect("/login");
}

// Local host
app.listen(3000,"127.0.0.1" , function() {
  console.log("server started");
})
