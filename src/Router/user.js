const express = require('express')
const User = require('../models/user')
const router = express.Router()
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeEmail, sendAccDeleteEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
  const user = new User(req.body)

  try {
    await user.save()
    sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    res.status(201).send({
      user,
      token
    })
  } catch (e) {
    res.status(400).send(e)
  }
  // user.save().then(() => {
  //   res.status(201).send(user)
  // }).catch((error) => {
  //   res.status(400).send(error)
  // })
  //
  // res.send("Testing!!")
})

router.post('/users/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    res.status(200).send({
      user,
      token
    })
  } catch (e) {
    res.status(400).send()
  }
})

router.post('/users/logout', auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token
    })
    await req.user.save()
    res.status(201).send()
  } catch (e) {
    res.status(500).send()
  }
})

router.post('/users/logoutAll', auth, async (req, res) => {
  try {
    req.user.tokens = []
    await req.user.save()
    res.status(201).send()
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/users/me', auth, async (req, res) => {

  res.send(req.user)
  // try {
  //   const users = await User.find({})
  //   res.status(401).send(users)
  // } catch (e) {
  //   res.status(500).send()
  // }
  // User.find({}).then((users) => {
  //   res.status(201).send(users)
  // }).catch((e) => {
  //   res.status(500).send()
  // })
})


router.patch('/users/me', auth, async (req, res) => {
  const validUpdate = ['name', 'email', 'password', 'age']
  const update = Object.keys(req.body)
  const check = update.every((update) => validUpdate.includes(update))
  if (!check) {
    return res.status(400).send('Invalid Updates')
  }
  try {
    update.forEach((item) => req.user[item] = req.body[item])
    await req.user.save()
    res.send(req.user)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/users/me', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id)
    // if (!user) {
    //   return res.status(404).send()
    // }
    await req.user.remove()
    sendAccDeleteEmail(req.user.email, req.user.name)
    res.send(req.user)
  } catch (e) {
    res.status(400).send()
  }
})

const upload = multer({
  limits: {
    filsSize: 1000000
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload image file in jpg, jpeg or png'))
    }
    cb(undefined, true)
  }
})
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

  const buffer = await sharp(req.file.buffer).resize({width:250, height: 250}).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  res.send()
}, (error, req, res, next) => {
  res.status(400).send({
    error: error.message
  })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
  req.user.avatar = undefined
  await req.user.save()
  res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
      const user = await User.findById(req.params.id)

      if(!user || !user.avatar){
        throw new Error()
      }

      res.set('Content-Type','image/png')
      res.send(user.avatar)

    }catch(e){
      res.status(404).send()
    }
})

module.exports = router
