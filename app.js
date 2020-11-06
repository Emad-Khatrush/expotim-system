var express               = require("express"),
    bodyParser            = require("body-parser"),
    mongoose              = require("mongoose"),
    session               = require("express-session"),
    passport              = require("passport"),
    localStrategy         = require("passport-local").Strategy,
    passportLocalMongoose = require("passport-local-mongoose"),
    User                  = require("./models/user");

var app = express();
// setup packages
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

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

app.use( function(req,res,next){
  res.locals.currentUser = req.user;
  next();
});

// var data = {
//   username: "emadkhatrush@hotmail.com",
//   firstName: "emad",
//   lastName: "khatrush",
//   title: "coordinator",
//   phone: 05535728209,
//   isAdmin: true
// }
// User.register(data, "123456", function(err, user){
//   if (err) {
//     console.log(err);
//     res.reditect("/employee/login")
//   }else {
//     passport.authenticate("local")(req,res,function(){
//       res.redirect("/employee/dashboard");
//     })
//   }
// })

//-------------------------------
//            Routes
//-------------------------------

// Login Route: GET
app.get("/employee/login", function(req,res){
  // var data = {
  //   username: "emadkhatrush@hotmail.com",
  //   firstName: "emad",
  //   lastName: "khatrush",
  //   title: "coordinator",
  //   phone: 05535728209,
  //   isAdmin: true
  // }
  // User.register(data, "123456", function(err, user){
  //   if (err) {
  //     console.log(err);
  //     res.reditect("/employee/login")
  //   }else {
  //     passport.authenticate("local")(req,res,function(){
  //       res.redirect("/employee/dashboard");
  //     })
  //   }
  // })
  res.render("./Login/login");
})
// Login Route: POST
app.post("/employee/login",
passport.authenticate("local",{
  failureRedirect: "/employee/login"
}),function(req,res){
  res.redirect("/employee/dashboard");
})
// logout route
app.get("/employee/logout",function(req,res){
  req.logout();
  res.redirect("/employee/login");
});

// dashboard Route
app.get("/employee/dashboard",isLogin ,function(req,res){
  res.render("./dashboard/dashboard");
})
app.get("/employee/dashboard/add-data", isLogin,function(req,res){
  res.render("./dashboard/add-data");
})
app.get("/employee/dashboard/myreports", isLogin,function(req,res){
  res.render("./dashboard/myReports");
})


function isLogin(req, res, next) {
  if(req.isAuthenticated())
  {
    return next();
  }
  res.redirect("/employee/login");
}

// Local host
app.listen(3000,"127.0.0.1" , function() {
  console.log("server started");
})
