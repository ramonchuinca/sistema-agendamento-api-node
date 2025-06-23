const mongoose = require('mongoose')

const AgendamentoSchema = new mongoose.Schema({
  data: { type: Date, required: true },
  hora: { type: String, required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }
});



module.exports = mongoose.model('Agendamento', AgendamentoSchema)
