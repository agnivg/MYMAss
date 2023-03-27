const express=require('express')
const app=express()
const cors=require('cors')
const mongoose=require('mongoose')
const cookieParser=require('cookie-parser')
const path=require('path')
const session = require('express-session')
const passport = require('passport')
const auth=require('./middleware/auth')
const User=require('./models/UserSchema')

const {MONGODB_URI,CLIENTID,SECRET}=require('./config/secrets')
const PORT=process.env.PORT||8000
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'SECRET' 
  }));

mongoose.connect(MONGODB_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
}).then(()=>console.log("Connection successful")).catch((err)=>{
    console.log(err);
})

app.use(cors());
app.use(cookieParser());
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('./routes/authentication'))
app.set("view engine","ejs")

var userProfile;

app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.get('/register',(req,res)=>{
    res.render('signup',{
        msg: ""
    })
})
app.get('/login',(req,res)=>{
    res.render('signin',{
        msg: ""
    })
})
app.get('/',auth,(req,res)=>{
    res.render('home',{
        user:req.user
    })
})

const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
passport.use(new GoogleStrategy({
    clientID: CLIENTID,
    clientSecret: SECRET,
    callbackURL: "https://mym-ass-nasa.onrender.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }))
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    const token="google-oauth"+userProfile.displayName
    const time=24*60*60*1000 // 1 day
    res.cookie("jwt",token,{expires: new Date(Date.now()+time),httpOnly:true})    
    res.redirect('/');
  });

app.listen(PORT,()=>{
    console.log(`Listening to PORT ${PORT}`)
})