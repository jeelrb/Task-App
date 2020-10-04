const express = require('express')
require('./db/mongoose')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./Router/user')
const taskRouter = require('./Router/task')
const app = express()
const port = process.env.PORT


// app.use((req, res, next) => {
//   res.status(503).send('Site is Under maintainance')
// })

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
  console.log('Server is up on port : ' + port)
})
