const express = require('express')
const morgan = require('morgan')
const app = express()


morgan.token('body', (request, response) => { 
    if (request.method == 'POST') {
    return `{"name": ${JSON.stringify(request.body.name)}, "number": ${JSON.stringify(request.body.number)}}`
} else {return ' '}})


app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))


let persons = [
    {   id: "1",
        name: 'Arto Hellas', 
        number: '040-123456' },
    {   id: "2",
        name: 'Ada Lovelace', 
        number: '39-44-5323523' },
    {   id: "3",
        name: 'Dan Abramov', 
        number: '12-43-234345' },
    {   id: "4",
        name: 'Mary Poppendieck', 
        number: '39-23-6423122' }
]

app.get('/api/persons', (request, response) => {
if (persons) {
    response.json(persons)
  }else {
    response.status(404).end()
  }})

function getrandomId(max) {
    return Math.floor(Math.random()*max)
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    const person = {
        "id": getrandomId(1000000000),
        "name": body.name,
        "number": body.number
    }

    if (person.name.length == 0 || person.number.length == 0)  {
        return response.status(400).json({ 
            error: 'person name or number is missing' 
        })} 
    if (persons.some((p) => p.name == person.name))  {
        return response.status(400).json({ 
            error: 'persons name is already in phonebook' 
        })}

    
    persons = persons.concat(person)

    response.json(person)
})

app.get('/info', (request, response) => {
const timestamp = new Date()
if (persons) {
    response.send(`<p>Phonebook has info for ${persons.length} people</p>
        <p>${timestamp.toString()}</p>`)
    }else {
    response.status(404).end()
    }})

 
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
if (person) {
    response.json(person)
    }else {
    response.status(404).end()
    }})

app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    
    response.status(204).end()
    })

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)

