var express               = require("express"),
    app                   = express(),
    bodyParser            = require("body-parser"),
    expressSanitizer      = require("express-sanitizer"),
    passport              = require("passport"),
    User                  = require("./models/user.js"),
    Insurance             = require("./models/insurance.js"),
    Buy                   = require("./models/buy.js"),
    New                   = require("./models/new.js"),
    LocalStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    nodemon               = require("nodemon"),
    mongoose              = require("mongoose");
mongoose.connect("mongodb://localhost/auth_app");

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(require("express-session")({
    secret: "My name is Pavani Koduri",
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var buy = false, id, message="", currentUser = "", sum_ass, period, premium;

//ROUTES
app.get("/",function(req, res){
   New.find({}, function(err, news) {
        if(err){
            console.log(err);
        }
        else{
            res.render("index", {news : news});
        }
    });
});
app.post("/", function(req, res) {
    //req.body.insurance.content=req.sanitize(req.body.insurance.content);
    
    New.create(req.body.new, function(err, newNew){
        if(err){
            console.log(err);
        }
        else{
            res.redirect("/");
        }
    });
});
app.post("/index", function(req, res) {
    //req.body.insurance.content=req.sanitize(req.body.insurance.content);
    
    Insurance.create(req.body.insurance, function(err, newInsurance){
        if(err){
            console.log(err);
        }
        else{
            console.log(newInsurance);
            var typ = newInsurance.type;
            console.log(typ);
            res.redirect("/"+typ.charAt(0).toLowerCase()+typ.substring(1,typ.length)+"dbtry");
        }
    });
});
app.get("/life",function(req, res){
   res.redirect("/lifedb"); 
});
app.get("/health",function(req, res){
   res.redirect("/healthdbtry"); 
});
app.get("/travel",function(req, res){
   res.redirect("/traveldb"); 
});
app.get("/traveldb",function(req, res){
    Insurance.find({type : "Travel"}, function(err, insurances) {
        if(err){
            console.log(err);
        }
        else{
            res.render("traveldb", {insurances : insurances});
        }
    });
});
app.get("/healthdbtry",function(req, res){
    Insurance.find({type : "Health"}, function(err, insurances) {
        if(err){
            console.log(err);
        }
        else{
            res.render("healthdbtry", {insurances : insurances});
        }
    });
});
app.get("/lifedb",function(req, res){
    Insurance.find({type : "Life"}, function(err, insurances) {
        if(err){
            console.log(err);
        }
        else{
            res.render("lifedb", {insurances : insurances});
        }
    });
});
app.get("/homedb",function(req, res){
    Insurance.find({type : "Home"}, function(err, insurances) {
        if(err){
            console.log(err);
        }
        else{
            res.render("homedb", {insurances : insurances});
        }
    });
});

app.get("/home",function(req, res){
   res.redirect("/homedb"); 
});
app.post("/buynow/:id", function(req, res){
    sum_ass = req.body.sum;
    period = req.body.time *12;
    premium = (sum_ass*12)/(period * 100);
    period--;
    id = req.params.id;
    console.log("Here I amm!!");
    console.log(sum_ass);
    console.log(period);
    console.log(premium);
    console.log(id);
    res.redirect("/buyone");
});
app.get("/buyone", didBuy(true), function(req, res){
    make_entry();
    res.render("buynow",{user : currentUser});
});
app.get("/admin", function(req, res) {
   res.render("admin"); 
});
app.get("/admin_home", isLoggedIn, function(req, res) {
   res.render("admin_home",{user : currentUser}); 
});
app.get("/user_home", isLoggedIn, function(req, res) {
    User.find({username : currentUser}, function(err, foundUser) {
        if(err){
            console.log(err);
        }
        else{
            if(foundUser.length>0){
                Buy.find({username : currentUser}, function(err, foundBuy) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Kya karu");
                        console.log(foundBuy);
                        console.log("Hello111111");
                        res.render("user_home",{user : foundBuy, un : foundUser});
                    }
                });
            }
        }
    })
    
 
});


//Auth routes
//Show signup form
app.get("/register",function(req, res){
    message = "";
    res.render("register",{message : message});
});
//Handling signup
app.post("/register",function(req, res){
    
    User.register(new User({fullname : req.body.fullname, username : req.body.username, email : req.body.email}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            console.log("Baba re");
            message ="Username and Email should be unique!";
            return res.render("register",{message : message});
        } 
        passport.authenticate("local")(req, res, function(){
            currentUser = ""+req.body.username;
            if(!buy)res.redirect("/user_home"); 
            else{
                make_entry();
                res.render("buynow",{user : currentUser});
            } 
        });
    });
});
//Login Routes
//Show Login form
app.get("/login", function(req, res) {
   res.render("login",{login_errors : req.session.messages || []}); 
   req.session.messages=[];
});
//Handling login
//middleware
app.post("/login", passport.authenticate("local",{
            failureMessage: "Invalid Username or Password!",
            failureRedirect: "/login",
        }),function(req, res){
            var userNm = ""+req.body.username;
            User.find({username : userNm}, function(err, foundUser){
                if(err){
                    console.log(err);
                }
                else{
                    currentUser = userNm;
                    console.log(buy);
                    console.log(foundUser);
                    if(foundUser[0].isAdmin){
                        res.redirect("/admin_home");
                    }
                    else if(buy==true){
                        make_entry();
                        res.render("buynow",{user : currentUser});
                    }
                    else res.redirect("/user_home");
                    
                }
            });
});

//Logout Routes
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});
//get by id
app.get("/:id", function(req,res){
    Insurance.findById(req.params.id, function(err, foundInsurance){
            if(err){
                console.log(err);
            }
            console.log(foundInsurance);
            res.render("showone",{insurance: foundInsurance}); 
    });

});
app.get("/paynow/:id", function(req, res) {
    var bId = req.params.id; 
    Buy.findOne({username : currentUser}, function(err, foundBuy) {
        if(err){
            console.log(err);
        }
        else{
            console.log("Ye lo!");
            console.log(foundBuy);
            for(var i=0; i<foundBuy.buys.length; i++)
            {
                if(foundBuy.buys[i]._id == bId)
                {
                    foundBuy.buys[i].time--;
                    foundBuy.save();
                }
            }
            res.render("buynow",{user : currentUser});
        }
    })

});
app.get("/claimnow/:id", function(req, res) {
    var bId = req.params.id; 
    Buy.find({username : currentUser}, function(err, foundBuyer) {
        if(err){
            console.log(err);
        }
        else{
            var foundBuy = foundBuyer[0];
            
            for(var i=0; i<foundBuy.buys.length; i++)
            {
                if(foundBuy.buys[i]._id == bId)
                {   //var j;
                    for(var j=i+1; j<foundBuy.buys.length; j++){
                        foundBuy.buys[j-1]=foundBuy.buys[j];
                    }
                    foundBuy.buys.pop();
                    foundBuy.save();
                    console.log("Get lost");
                    console.log(foundBuy);
                    res.render("claim",{user : currentUser});
            
                }
            }
        }
    });
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}
function didBuy(b) {
  return function(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    buy = b;
    res.redirect("/login");
  }
}
function make_entry(){
    for(var i=0;i<10;i++){console.log("in");}
    Insurance.findById(id, function(err, foundInsurance) {
       if(err){
           console.log(err);
       }
       else{
           console.log(foundInsurance);
           console.log("1");
           console.log(""+currentUser);
           Buy.find({username : ""+currentUser}, function(err, foundBuy) {
               if(err){
                   console.log(err);
                    }
               else{
                   if(foundBuy.length==0){
                       Buy.create({username : ""+currentUser, buys : [{policy : foundInsurance.title, time : period, sum : sum_ass, prem : premium}]}, function(err, creBuy){
                          if(err){
                              console.log(err);
                          } 
                          else{
                              console.log(creBuy);
                          }
                        });
                    }
                   else{
                   console.log(foundBuy[0]);
                   var new_buy = {policy : foundInsurance.title, time : period, sum : sum_ass, prem : premium};
                   foundBuy[0].buys.push(new_buy);
                   foundBuy[0].save();
                   }
               }
           });
       }
    });
    
}
app.listen(process.env.PORT,process.env.IP,function(){
   console.log("SeLab Server Up!!!"); 
});