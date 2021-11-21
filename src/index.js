const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')

const app = express()

app.use(cors())
app.use(express.json())

const users = []

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find((item) => item.username === username)
  if (!user) {
    return response.status(404).json({ error: 'User not found' })
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  if (users.find((item) => item.username === username)) {
    return response.status(400).json({ error: 'User already exists!' })
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.status(201).json(user)
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { user } = request
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline).toISOString(),
    created_at: new Date().toISOString()
  }
  user.todos.push(todo)
  return response.status(201).json(todo)
})

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { title, deadline } = request.body
  const { user } = request
  if (!user.todos.find((item) => item.id === id)) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  user.todos = user.todos.map((item) => {
    return item.id === id ? { ...item, title, deadline } : item
  })
  const todo = user.todos.find((item) => item.id === id)
  return response.json({
    title: todo.title,
    deadline: todo.deadline,
    done: todo.done
  })
})

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  if (!user.todos.find((item) => item.id === id)) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  user.todos = user.todos.map((item) => {
    return item.id === id ? { ...item, done: true } : { ...item }
  })
  const todo = user.todos.find((item) => item.id === id)
  return response.json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todoIndex = user.todos.findIndex((item) => item.id === id)
  if (todoIndex === -1) {
    return response.status(404).json({ error: 'Todo not found!' })
  }
  user.todos.splice(todoIndex, 1)
  return response.status(204).send()
})

module.exports = app
