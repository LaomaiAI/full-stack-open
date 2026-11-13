/* global describe, test, expect, beforeEach, afterAll */
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = require('../app')
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

const getToken = async (username = 'root', password = 'sekret') => {
  const response = await api.post('/api/login').send({ username, password })
  return response.body.token
}

const createUser = async (username, password, name) => {
  const passwordHash = await bcrypt.hash(password, 10)
  const user = new User({ username, name, passwordHash })
  return user.save()
}

let rootUser

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  rootUser = await createUser('root', 'sekret', 'Superuser')
  await createUser('other', 'sekret', 'Other User')
  const blogObjects = helper.initialBlogs.slice(0, 2).map((blog) => new Blog({ ...blog, user: rootUser._id }))
  const promiseArray = blogObjects.map((blog) => blog.save())
  await Promise.all(promiseArray)
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api.get('/api/blogs').expect(200).expect('Content-Type', /application\/json/)
  })
  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(2)
  })
  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')
    const titles = response.body.map((blog) => blog.title)
    expect(titles).toContain('React patterns')
  })
  test('blogs have id property instead of _id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined()
      expect(blog._id).toBeUndefined()
    })
  })
  test('a specific blog can be viewed', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]
    const resultBlog = await api.get(`/api/blogs/${blogToView.id}`).expect(200).expect('Content-Type', /application\/json/)
    expect(resultBlog.body.title).toEqual(blogToView.title)
  })
})

describe('addition of a new blog', () => {
  test('succeeds with valid data and a token', async () => {
    const token = await getToken()
    const newBlog = { title: 'Canonical string reduction', author: 'Edsger W. Dijkstra', url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html', likes: 12 }
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201).expect('Content-Type', /application\/json/)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(3)
    const titles = blogsAtEnd.map((blog) => blog.title)
    expect(titles).toContain('Canonical string reduction')
  })
  test('likes defaults to 0 when missing', async () => {
    const token = await getToken()
    const newBlog = { title: 'A blog without likes', author: 'Nobody', url: 'http://example.com/' }
    const response = await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(201)
    expect(response.body.likes).toBe(0)
  })
  test('fails with status 400 when title is missing', async () => {
    const token = await getToken()
    const newBlog = { author: 'Nobody', url: 'http://example.com/', likes: 3 }
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(2)
  })
  test('fails with status 400 when url is missing', async () => {
    const token = await getToken()
    const newBlog = { title: 'No url here', author: 'Nobody', likes: 3 }
    await api.post('/api/blogs').set('Authorization', `Bearer ${token}`).send(newBlog).expect(400)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(2)
  })
  test('fails with status 401 when no token is provided', async () => {
    const newBlog = { title: 'No token', author: 'Nobody', url: 'http://example.com/', likes: 3 }
    await api.post('/api/blogs').send(newBlog).expect(401)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(2)
  })
})

describe('deletion of a blog', () => {
  test('succeeds with status 204 if done by the creator', async () => {
    const token = await getToken()
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(204)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)
    const titles = blogsAtEnd.map((blog) => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
  })
  test('fails with status 401 if done by another user', async () => {
    const token = await getToken('other', 'sekret')
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).set('Authorization', `Bearer ${token}`).expect(401)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
  test('fails with status 401 when no token is provided', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]
    await api.delete(`/api/blogs/${blogToDelete.id}`).expect(401)
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})

describe('updating a blog', () => {
  test('succeeds in updating the number of likes', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]
    const updated = { ...blogToUpdate, likes: 99 }
    const response = await api.put(`/api/blogs/${blogToUpdate.id}`).send(updated).expect(200)
    expect(response.body.likes).toBe(99)
    const blogsAtEnd = await helper.blogsInDb()
    const updatedInDb = blogsAtEnd.find((blog) => blog.id === blogToUpdate.id)
    expect(updatedInDb.likes).toBe(99)
  })
})
