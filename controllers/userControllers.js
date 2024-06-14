const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('../models/userSchema')
const jwt = require('jsonwebtoken')
const Wallet = require('../models/walletSchema')
const secret = "Yunus@123&c"

function user_register (req, res){
    let {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({message : "Enter credentials properly"})
    }
    User.findOne({email : email}, (error, result)=>{
        if(error){
            return res.status(500).json(error.message)
        }
        if(result){
            return res.status(400).json({error : "Email already exists"})    
        }
        
        bcrypt.hash(password, 12, (error, hashedpassword)=>{
            if(error){
                return res.status(500).send(error.message)
            }
            password = hashedpassword
            const refreshToken = jwt.sign({email : email}, secret, {expiresIn : "2m"})

            let user = {
                email : email,
                password : password,
                refreshToken : refreshToken
            }

            User.create(user, (error, userRes)=>{
                if(error){
                   return res.status(500).send(error.message)
                }
                if(userRes){
                   let wallet = {
                    balance: 0,
                    userId: userRes._id
                   }
                   Wallet.create(wallet, (error, walletRes)=>{
                    if(error){
                        return res.status(500).send(error.message)
                    }
                    const token = jwt.sign({userId : userRes._id}, secret, {expiresIn : "1m"})

                    return res.status(200).json({message : "User created successfully", token})
                   })
                }
            })
        })
    }    
)
}

function user_login (req, res){
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({message : "Enter login credentials properly"})
    }
    User.findOne({email : email}, (error, userLogin)=>{
        if(error){
            return res.status(500).send(error.message)
        }
        if(!userLogin){
            return res.status(400).json({message : "Email doesn't exist"})
        }
        
        bcrypt.compare(password, userLogin.password, (error, isMatch)=>{
            if(error){
                return res.status(500).json(error.message)
            }
            if(!isMatch){
                return res.status(400).json({error : "Incorrect Password"})
            } 
            Wallet.findOne({ userId: userLogin._id }, (error, wallet)=>{
                if(error){
                    return res.status(500).send(error.message)
                }
                const token = jwt.sign({userId : userLogin._id}, secret, {expiresIn : '1m'})
                const refreshToken = jwt.sign({userId : userLogin._id}, secret, {expiresIn : '2m'})
                User.findByIdAndUpdate(userLogin._id , {refreshToken : refreshToken}, (error, updateUser)=>{
                    if(error){
                        return res.status(500).json({message : error.message})
                    }
                    return res.status(200).json({message: "Login successfull", "Current balance is" : wallet.balancetoken, token})
                })            
            })
        })
    })  
}

function change_user_password (req, res){
    console.log("i m chnage user password")
    const userId = req.auth.userId
    const token = req.auth.token
    console.log(userId, token) 
    const {password, newpassword} = req.body
    User.findById(userId, (error, userLogin)=>{
        if(error){
            return res.status(500).send(error.message)
        }
        if(!userLogin){
            return res.status(400).json({message: "Email not found"})
        }
        //console.log("userLogin--->",userLogin)
        bcrypt.compare(password, userLogin.password, (error, isMatch)=>{
            if(error){
                return res.status(500).json({message : error.message})
            }

            if(!isMatch) {
               return res.status(400).json({message : "Password incorrect"})
            }
            console.log(newpassword)
            bcrypt.hash(newpassword, 12, (error, hashedNewPassword)=>{
                if(error){
                    return res.status(500).json({message : error.message})
                }
                User.findByIdAndUpdate(userId,{ password: hashedNewPassword}, (error, UpdatedUserPassword)=>{
                    if(error){
                        return res.status(500).send(error.message)
                    }
                    if(UpdatedUserPassword){
                        Wallet.findOneAndUpdate({userId: userId}, {$inc : {balance : -3}}, {new:true}, (error, updatedWallet)=>{
                            if(error){
                                return res.status(500).send(error.message)
                            }
                            if(token){
                                return res.status(200).json({message : "Password changed successfully", "Current balance is" : updatedWallet.balance, token})
                            }else{
                                return res.status(200).json({message : "Password changed successfully", "Current balance is" : updatedWallet.balance})
                            }
                                
                        });
                    }
                    else {
                        return res.status(500).json({message: "Password didn't changed. Please try again"})
                    }
                });
            })
        })
    })
}

module.exports = {
    user_register,
    user_login,
    change_user_password
}