require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api', require('./routes'))

mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log('MongoDB conectado')
  app.listen(process.env.PORT, () =>
    console.log(`Servidor rodando em http://localhost:${process.env.PORT}`)
  )
})
.then(() => console.log("MongoDB conectado com sucesso"))
.catch((err) => console.error("Erro ao conectar ao MongoDB:", err));
