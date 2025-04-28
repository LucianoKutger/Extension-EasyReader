require('dotenv').config()
const express = require('express')
const cors = require('cors')

const PORT = process.env.PORT || 5001

const app = express()


//Enable cors
app.use(cors())

//Routes
app.use('/api', require('./routes'))


app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`))