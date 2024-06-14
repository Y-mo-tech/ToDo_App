const mongoose = require('mongoose');
const User = require('./userSchema.js')
const taskSchema = mongoose.Schema({
    title : {
        type : String,
        maxLength: 10
    },
    description: {
        type: String,
        maxLength: 200
    },
    isCompleted:{
        type: Boolean,
        default: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;