const mongoose = require('mongoose');

const agendamentoSchema = new mongoose.Schema({

  data: String,
  hora: String
});

module.exports = mongoose.model('Agendamento', agendamentoSchema);

