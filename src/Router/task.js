const express = require('express')
const Task = require('../models/task')
const router = express.Router()
const auth = require('../middleware/auth')

router.post('/tasks', auth, async (req, res) => {

  //const task = new Task(req.body)

  const task = new Task({
    ...req.body,
    owner: req.user._id
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
  //
  // task.save().then(() => {
  //   res.status(201).send(task)
  // }).catch((error) => {
  //   res.status(400).send(error)
  // })
})

router.get('/tasks', auth, async (req, res) => {

  const match = {}
  const sort = {}

  if(req.query.completed){
    match.completed = req.query.completed === 'true'
  }

  if(req.query.sortBy){
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
  }

  try {
    //const tasks = await Task.find({owner:req.user._id})
    await req.user.populate({
      path: 'tasks',
      match,
      options: {
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
        sort
      }
    }).execPopulate()

    res.status(201).send(req.user.tasks)
  } catch (e) {
    console.log(e)
    res.status(400).send({error:e})
  }
  // Task.find({}).then((tasks) => {
  //   res.status(201).send(tasks)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  try {
    const task = await Task.findOne({_id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.status(201).send(task)
  } catch (e) {
    res.status(500).send(e)
  }
  // Task.findById(_id).then((task) => {
  //   if (!task) {
  //     return res.status(404).send()
  //   }
  //   res.status(201).send(task)
  // }).catch((e) => {
  //   res.status(500).send(e)
  // })
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const validUpdate = ['completed', 'description']
  const update = Object.keys(req.body)
  const check = update.every((update) => validUpdate.includes(update))
  if (!check) {
    return res.status(400).send({error:'Invalid Updates'})
  }
  try {
    // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true
    // })
    const task = await Task.findOne({_id:req.params.id, owner: req.user._id})

    if (!task) {
      return res.status(404).send()
    }

    update.forEach((item) => task[item] = req.body[item])
    await task.save()
    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id})
    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(400).send()
  }
})

module.exports = router
