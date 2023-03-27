const bcrypt = require('bcryptjs')
const express=require('express')
const router=express.Router()
const User=require('../models/UserSchema')
const jwt=require('jsonwebtoken')
const {JWT_SECRET}=require('../config/secrets')
const auth=require('../middleware/auth')

router.post('/signup',async (req,res)=>{
    const {name,username,password}=req.body;
    try{
        const hashedPassword = await bcrypt.hash(password, 12)
        const user=new User({
            username:username,
            name:name,
            password:hashedPassword
        })
        await user.save()
        res.redirect('/login')
    }catch(err){
        res.render('signup',{
            msg: "Username already exists"
        })
    }
})

router.post('/signin',async (req,res)=>{
    const {username,password}=req.body
    try{
        const user=await User.findOne({username:username})
        const val=await bcrypt.compare(password,user.password)
        if(val){
            const token=jwt.sign({_id:user._id},JWT_SECRET)
            user.password=null
            const time=24*60*60*1000 // 1 day
            res.cookie("jwt",token,{expires: new Date(Date.now()+time),httpOnly:true})
            return res.redirect('/')
        }
        else
            res.render('signin',{
            msg: "Invalid username/password"
        })
    }catch(err){
        res.render('signin',{
            msg: "Invalid username/password"
        })
    }
})

router.get('/logout',auth,(req,res)=>{
    res.clearCookie("jwt")
    res.redirect('/login')
})

module.exports=router