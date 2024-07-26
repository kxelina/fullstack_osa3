require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (request, response) => { 
    if (request.method == 'POST') {
    return `{"name": ${JSON.stringify(request.body.name)}, "number": ${JSON.stringify(request.body.number)}}`
    } else {return ' '}})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/api/persons', (request, response, next) => {
    const persons = Person.find({}).then(persons => {
    response.json(persons) }).catch(error => next(error))
  if (!persons)  {
    response.status(404).end()
  }})

function getrandomId(max) {
    return Math.floor(Math.random()*max)
    }

app.post('/api/persons', (request, response, next) => {
    const body = request.body
    
    if (body.name.length == 0 || body.number.length == 0)  {
        return response.status(400).json({ 
            error: 'person name or number is missing' 
        })} 

    const person = new Person({
    "id": getrandomId(1000000000).toString(),
    "name": body.name,
    "number": body.number})
    person.save().then(result => { 
    response.json(person)
    console.log(`added ${person.name} number ${person.number} to phonebook`)})
    .catch(error => next(error))
    })

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    Person.findByIdAndUpdate( 
    request.params.id,
    {name: body.name, number: body.number},
    {new: true, runValidators: true, context: 'query'})
    .then(newperson => {
    response.json(newperson)})
    .catch(error => next(error))
    })

app.get('/info', (request, response, next) => {
    Person.countDocuments({}).then(persons => {
    const timestamp = new Date()
    response.send(`<p>Phonebook has info for ${persons} people</p>
    <p>${timestamp.toString()}</p>`) }).catch(error => next(error))})
    
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(person => {
    if (person) {
    response.json(person)
    }else {
    response.status(404).end()
    }}).catch(error => {
        next(error)
    })})

app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findByIdAndDelete(id).then(result => {
      response.status(204).end()  
    }).catch(error => next(error))})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
    }

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    
    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    }

    if (error.name === 'ValidationError') {
        return response.status(400).send({ error: error.message })
    }
    
    next(error)
    }

app.use(errorHandler)

const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
