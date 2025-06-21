require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'https://seu-site.netlify.app']
}));
app.use(express.json());

app.use('/api', require('./routes'));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado');
    app.listen(process.env.PORT || 3000, () =>
      console.log(`Servidor rodando em http://localhost:${process.env.PORT || 3000}`)
    );
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

