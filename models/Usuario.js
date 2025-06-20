const mongoose = require('mongoose')

const UsuarioSchema = new mongoose.Schema({
  nome: String,
  peso: Number,
  altura: Number,
})

module.exports = mongoose.model('Usuario', UsuarioSchema)