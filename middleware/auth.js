const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../config/secrets')
const User=require('../models/UserSchema')

module.exports=(req,res,next)=>{
    const token=req.cookies.jwt       
    if(!token)
        return res.redirect('/login')
    if(token.startsWith("google-oauth")){
        const name=token.substring(12)
        const user=new User({
            username:null,
            name:name,
            password:null
        })
        req.user=user
        return next()        
    }
    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err)
            return res.redirect('/login')
        const {_id}=payload
        User.findById(_id).then(userdata=>{
            userdata.password=null
            req.user=userdata
            next()
        })
    })
}