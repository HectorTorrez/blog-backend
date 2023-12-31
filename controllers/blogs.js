const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(blogs)
  } catch (error) {
    next(error)
    response.status(404).json({ error: error.message })
  }
})

blogsRouter.get('/:id', async (request, response) => {
  const id = request.params.id
  const blog = await Blog.findById(id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).json({ message: 'blog not found' })
  }
})

blogsRouter.post('/', async (request, response, next) => {
  const { title, author, blogText } = request.body
  const token = request.token

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
      return response.status(401).json({ error: 'token invalid' })
    }

    const user = await User.findById(decodedToken.id)
    const newBlog = new Blog({
      title,
      author,
      blogText,
      user: user._id
    })
    const blog = await newBlog.save()
    user.blogs = user.blogs.concat(blog._id)
    await user.save()
    response.status(201).json(blog)
  } catch (error) {
    console.log(error.message)
    if (error.name === 'ValidationError') {
      response.status(400).json(error.message)
    }
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json(error.message)
    }
    if (error.name === 'TokenExpiredError') {
      return response.status(401).json(error.message)
    }

    next(error)
  }
})

blogsRouter.patch('/:id', async (request, response, next) => {
  try {
    const { title, author, blogText } = request.body
    const id = request.params.id
    const updatedBlog = {
      title,
      author,
      blogText
    }
    const foundBlog = await Blog.findByIdAndUpdate(id, updatedBlog, { new: true })
    response.json(foundBlog).status(200)
  } catch (error) {
    next(error)
    response.status(400).json({ error: error.message })
  }
})

blogsRouter.delete('/:id', async (request, response, next) => {
  try {
    const id = request.params.id
    await Blog.findByIdAndDelete(id)
    response.status(204).end()
  } catch (error) {
    next(error)
    response.status(400).json({ error: error.message })
  }
})

module.exports = blogsRouter
