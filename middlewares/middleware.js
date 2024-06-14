const jwt = require('jsonwebtoken')
const User = require('../models/userSchema.js')
const secret = "Yunus@123&c"

function verify (req, res, next){
    let token = req.headers['x-access-token']
    if(!token){
        return res.status(400).json({message : "Token not provided"})
    }
    jwt.verify(token, secret, (err, decoded)=>{
        if(err){
            if(err.name == "TokenExpiredError"){
                const decodedExpiredtoken = jwt.decode(token)
                const userId = decodedExpiredtoken.userId
                if(!userId){
                    return res.status(500).json({message : "User not found"})
                }
                console.log("userId =>", userId)
                User.findById(userId, (error, user)=>{
                    if(error){
                        return res.status(500).json({message : error.message})
                    }
                    if(!user){
                        return res.status(400).json({message : "User not found"})
                    }
                    let refreshToken = user.refreshToken

                    console.log(refreshToken)
                    jwt.verify(refreshToken, secret, (refreshError, newdecoded)=>{
                        if(refreshError){
                            if(refreshError.name == "TokenExpiredError"){
                                return res.status(400).json({message : "You are logged out. Please login again"})

                            }else if(refreshError.name == 'JsonWebTokenError'){
                                return res.status(400).json({message : "Token doesn't match"})

                            }else{
                                return res.status(500).json({message : refreshError.message})
                                
                            }
                        }
                        token = jwt.sign({userId : userId}, secret, {expiresIn : '1m'})
                        refreshToken = jwt.sign({userId : userId}, secret, {expiresIn : '2m'})
                        User.findByIdAndUpdate(userId, {refreshToken : refreshToken}, (error, userUpdate)=>{
                            if(error){
                                return res.status(500).json({message : error.message})
                            }
                            if(userUpdate){
                                req.auth = {userId, token}
                                next()
                            }
                        })
                    })
                })
            }else if(err.name === 'JsonWebTokenError'){
                return res.status(400).json({message : "Token doesn't match"})
            }else{     

                return res.status(500).json({message : err.message})
            }
        }else{
            const userId = decoded.userId
            console.log(userId)
            req.auth = {userId}
            next()

        }
    })
}

module.exports = verify;