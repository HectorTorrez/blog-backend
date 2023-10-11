const loginRouter = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)
  console.log(passwordCorrect)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }
  const userFortoken = {
    username: user.username,
    id: user.id
  }
  console.log(userFortoken)

  const token = jwt.sign(userFortoken, process.env.SECRET)
  console.log(token)
  response.status(200).send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter