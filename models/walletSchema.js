const mongoose = require('mongoose')

const walletSchema = mongoose.Schema({
    balance:{
        type: Number,
        default : 0
    },
    userId: {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    }
})

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet