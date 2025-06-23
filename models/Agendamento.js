const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({
  usuario_id: mongoose.Schema.Types.ObjectId,
  nome: String,
  peso: Number,
  altura: Number,
  telefone: String,
  data: Date,
  hora: String
});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);




