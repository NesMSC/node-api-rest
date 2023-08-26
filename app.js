const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const { validateMovie, validatePartialMovie } = require('./Schemas/movies')

const app = express()
app.disable('x-powered-by')

const PORT = process.env.PORT ?? 1234

app.get('/', (req, res) => {
    res.json({
        message: "Hola mundo"
    })
})

app.get('/movies', (req, res) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:8080')
    const { genre } = req.query
    if(genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() == genre.toLowerCase())
        )
        res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) res.json(movie)

    res.status(404).json({
        message: "Not Found"
    })
})

app.use(express.json())

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)

    if(result.error) {
        return res.status(422).json({
            message: JSON.parse(result.error.message)
        })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    // Esto no seria rest, porque estamos guardando
    // el estado de la aplicacion en memoria
    movies.push()

    res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body)
    
    if(result.error) {
        return res.status(422).json({
            message: JSON.parse(result.error.message)
        })
    }
    
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id == id)

    if(movieIndex == -1) {
        return res.status(404).json({
            message: "Resource not found"
        })
    }

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    // proxima clase en base de datos
    movies[movieIndex] = updatedMovie

    res.json(movies[movieIndex])
})

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`)
})