const express = require('express');
require('./models/db.js')
const port = 7000;
const app = express();
app.use(express.json())
const user = require('./routes/userRoutes.js')
const task = require('./routes/taskRoutes.js')
app.use('/user', user);
app.use('/task', task)


app.listen(port, ()=>{
   console.log(`Listening to port no ${port}`)
})
