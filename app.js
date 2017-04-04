var express= require('express');
var path=require('path');
var bodyParser=require('body-Parser');
var cookieParser=require('cookie-Parser');
var expressSession=require('express-Session');
var passport= require('passport');
var passportLocal = require('passport-local');
var bcrypt= require('bcryptjs');
var passport = require('passport');
var passportLocal = require('passport-local');

var methodOverride = require('method-override');
var app=express();

var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var parser = require('xml2json');

var APIKey = "AIzaSyB_pTdwi_q5S4kWMUi0AUouZg2IVNyWuio";
var gurl = "https://maps.googleapis.com/maps/api/place/textsearch/xml?query=restaurants+in+Cupertino&key=AIzaSyB_pTdwi_q5S4kWMUi0AUouZg2IVNyWuio";
var g1url="https://maps.googleapis.com/maps/api/place/textsearch/xml?query=attractions&key=AIzaSyDpTAXl2VTBWoF-aRi7BG4xXHG_GiuEYms";
User = require('./models/user');
app.use(methodOverride());
mongoose.connect('mongodb://test:test@ds149030.mlab.com:49030/mytravelguide');
var db = mongoose.connection;

app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(cookieParser());
app.use(expressSession({
    secret: 'secret123',
    resave: true,
    saveUninitialized: true,
    activeDuration: 5 * 60 * 1000
}));
// To do local authentication below lines are mandatory
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(__dirname + '/public'));



request(gurl , function (error,response,body){
    if(!error && response.statuscode == 200){

       var arr = JSON.parse(response.body);
       var obj = arr[0];
        console.log(obj.id);      
    }
});






passport.use(new passportLocal.Strategy(function (username, password,done) {

	  User.getUserByUsername(username, function (err, username) {
	  	if (err) throw err;
	  	 if (!username) {
                    console.log('Unknown user');
                    return done(null, false, {
                        message: 'Unknown user'
                    });
                }else{
                	console.log(username);
                	var hash = username.password;
                	if (bcrypt.compareSync(password, hash)) {
                	  
                       console.log("Autehntication passed");
                        return done(null, {id:username._id,username:username.username});

                         }else{
                         	console.log('Invalid password');
                         	return done(null, false, {
                            message: 'Invalid password'
                           });
                         }   

                     }
	         });
   
}));



app.get('/',function(req,res){
	console.log("IS In Index"  , req.isAuthenticated());
	if(req.isAuthenticated())
	   console.log(req.user.username);
	//console.log("Request object is " , req.body );
	if(req.isAuthenticated()) {
	res.render('index',{
		isAuthenticated:req.isAuthenticated(), 
		 user:req.user.username 

	 	
	   });
	 }else {
	 	res.render('index',{
		isAuthenticated:false, 
		 user:"no data"

	 	
	   });
	 }
});

app.get('/login',function(req,res){
	res.render('login',{
		isAuthenticated:req.isAuthenticated(), 
		user:req.user
	});
	console.log("Inside login function" , req.isAuthenticated());
	//console.log("Inside login function", req.body);
});

app.post('/login',passport.authenticate('local', { failureRedirect: '/login' }),function(req,res){
    res.redirect("/mywelcomepage");
});

passport.serializeUser(function (username, done) {
	
    done(null, username.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, username) {
    	
        done(err, username);
    });
});


app.get('/mywelcomepage', isLoggedIn,function(req,res){
     console.log("In GEt welcome page", req.user);

     request({
    url: g1url
  
}, function (error, response, body) {
    if (error) {
        console.log(error);
    } else {

        //console.log(response.body);
        var jsonresultset = parser.toJson(response.body);
        var jresultset=JSON.parse(jsonresultset);
        //console.log(jresultset.PlaceSearchResponse);

        if(jresultset.PlaceSearchResponse.status==="OVER_QUERY_LIMIT"){

             res.render('mywelcomepage', {
                 isAuthenticated: req.isAuthenticated(),
                 user: req.user,
                 results: jresultset.PlaceSearchResponse

             });

        }else{
         
        console.log(jresultset.PlaceSearchResponse.result);

        console.log("AM I IN the ELSE LOOP");


         retStatus = 'Success';
            //res.send('done');

            // var value=res.json(data);
            // res.redirect('/team');
            /*res.send({
                retStatus: retStatus,
                data: JSON.parse(jsonresultset),
                isAuthenticated: req.isAuthenticated(),
                 user: req.user,
                redirectTo: '/mywelcomepage',
                msg: 'Just go there please' // this should help
            });*/

            res.render('mywelcomepage', {
                 isAuthenticated: req.isAuthenticated(),
                 user: req.user,
                 results: jresultset.PlaceSearchResponse.result

             });
            }

       /* var arr = JSON.parse(response.body);
        var obj = arr[0];
        console.log(obj);*/
    }
})
   /* res.render('mywelcomepage', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user

    });*/
})

app.post('/mywelcomepage',function(req,res){
    console.log("In Post welcome page", req.user);
    console.log("In Post welcome page", req.isAuthenticated());
     res.render('mywelcomepage', {
        isAuthenticated: req.isAuthenticated(),
        user: req.user

    });
})

// route middleware to make sure
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("local host" + port);
});