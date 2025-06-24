const mongoose = require('mongoose');

const AgendamentoSchema = new mongoose.Schema({
  usuario_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  data: {
    type: Date,
    required: true
  },
  hora: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Agendamento', AgendamentoSchema);
