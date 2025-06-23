const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({
  usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  data: String,
  hora: String
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);

