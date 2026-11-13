/* global describe, test, expect, beforeEach, afterAll */
const supertest = require('supertest')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', name: 'Superuser', passwordHash })
  await user.save()
})

afterAll(async () => {
  await mongoose.connection.close()
})

describe('when there is initially one user in db', () => {
  test('users are returned as json', async () => {
    await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/)
  })
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = { username: 'mluukkai', name: 'Matti Luukkainen', password: 'salainen' }
    await api.post('/api/users').send(newUser).expect(201).expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
    const usernames = usersAtEnd.map((u) => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()
    const newUser = { username: 'root', name: 'Superuser', password: 'salainen' }
    const result = await api.post('/api/users').send(newUser).expect(400).expect('Content-Type', /application\/json/)
    expect(result.body.error).toContain('expected `username` to be unique')
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
  test('creation fails with status 400 if username is too short', async () => {
    const newUser = { username: 'ab', name: 'Too Short', password: 'salainen' }
    await api.post('/api/users').send(newUser).expect(400)
  })
  test('creation fails with status 400 if password is too short', async () => {
    const newUser = { username: 'validname', name: 'Short Password', password: 'ab' }
    await api.post('/api/users').send(newUser).expect(400)
  })
  test('creation fails with status 400 if password is missing', async () => {
    const newUser = { username: 'validname', name: 'No Password' }
    await api.post('/api/users').send(newUser).expect(400)
  })
})

describe('login', () => {
  test('succeeds with correct credentials and returns a token', async () => {
    const response = await api.post('/api/login').send({ username: 'root', password: 'sekret' }).expect(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.username).toBe('root')
  })
  test('fails with status 401 with wrong password', async () => {
    await api.post('/api/login').send({ username: 'root', password: 'wrong' }).expect(401)
  })
  test('fails with status 401 with unknown username', async () => {
    await api.post('/api/login').send({ username: 'nobody', password: 'sekret' }).expect(401)
  })
})
