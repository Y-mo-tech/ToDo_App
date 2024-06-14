const mongoose = require('mongoose')
const Task = require('../models/taskSchema.js')
const User = require('../models/userSchema.js')
const Wallet = require('../models/walletSchema.js')

function task_add (req, res){
    const userId = req.auth.userId
    const token = req.auth.token
    // console.log(userId, token)
    const {title, description} = req.body;
    if(!title || !description){
        return res.status(400).json({message : "Enter title and description properly"})
    }
    
    let task = {
        title : title,
        description: description,
        userId: userId
    }
    Task.create(task, (error, createTask)=>{
        if(error){
            return res.status(500).json({error: error.message})
        }
        if(token){
            return res.status(200).json({message : "Task saved successfully", createTask, token})
        }
        else{
            return res.status(200).json({message : "Task saved successfully", createTask})
        }
    })
    
}

function getting_user_task (req, res){
    const userId = req.auth.userId
    const token = req.auth.token

       Task.find({userId : userId}, (error, tasks)=>{
           if(error){
            return res.status(500).send(error.message)
           }
           if(token){    
            if(!tasks || !tasks.length){
                return res.status(200).json({message : "No tasks are present for this user"}, token)
            }
            else{
                return res.status(200).json({message : "Tasks", tasks, token})              
            }  
           }
           else{
            if(!tasks || !tasks.length){
                return res.status(200).json({message : "No tasks are present for this user"})
            }
            else{
                return res.status(200).json({message : "Tasks", tasks})
            }
           }   
       })
}

function updating_task (req, res){
    const {userId, token} = req.auth
    console.log(userId, token)
    const taskId = req.params.id
    Task.findById(taskId, (error, task)=>{
        if(error){
            return res.status(500).json({message : error.message})
        }
        if(task.userId != userId){
            return res.status(400).json({message : "Task doesn't match with user's task"})
        }
        Task.findByIdAndUpdate(taskId, req.body, {new : true}, (error, updateTask)=>{
            if(error){
                return res.status(500).json({message : error.message})
            }
            Task.countDocuments({userId, isCompleted:true}, (error, checkAllTasks)=>{
                if(error){
                    return res.status(500).json({error : error.message})
                }
                if(checkAllTasks % 3 == 0){
                    Wallet.findOneAndUpdate({userId : userId}, {$inc : {balance:10}}, {new:true}, (error, balanceUpdate)=>{
                        if(error){
                            return res.status(500).json({error : error.message})
                        }
                        if(balanceUpdate){
                            if(token){
                                return res.status(200).json({updateTask, token})
                            }
                            else{
                                // console.log(balanceUpdate)
                                return res.status(200).json({updateTask});
                            }
                        }
                    })
                }
                else{
                    if(token){
                        return res.status(200).json({updateTask, token})
                    }else{
                        return res.status(200).json({updateTask});
                    }
                }
            })
        })
    })
}

function getting_all_tasks (req, res){
    Task.find({}, (error, allTasks)=>{
        if(error){
            return res.status(500).json({error : err.message})
        }
        if(!allTasks || !allTasks.length){
            return res.status(200).json({message : "No tasks are present"})
        }   
        return res.status(200).json(allTasks);
    })
}

module.exports = {
    task_add,
    getting_user_task,
    updating_task,
    getting_all_tasks
}