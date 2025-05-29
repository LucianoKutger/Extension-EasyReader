require('dotenv').config()
const express = require('express')
const cors = require('cors')

const PORT = process.env.PORT || 5001

const app = express()

const { authenticateProjectJWT } = require('./services/jwtAuth');

const proxyRoutes = require('./routes');


app.use(cors())

app.use(express.json());

app.use('/api', proxyRoutes);


app.listen(PORT, () => console.log(`Server running on Port: ${PORT}`))