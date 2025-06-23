const express = require('express');
const router = express.Router();

const usuarioCtrl = require('../controllers/usuarioController');
const agendamentoCtrl = require('../controllers/agendamentoController');

router.get('/', (req, res) => { res.json({ mensage: 'efetuado com sucesso' }) });
router.post('/login', usuarioCtrl.login);
router.get('/horarios-disponiveis/:data', agendamentoCtrl.horariosDisponiveis);
router.post('/agendar', agendamentoCtrl.store);
router.get('/agendamentos-com-usuarios', controller.listarComUsuarios);
router.use('/', require('./agendamento'));

router.get('/vagas-restantes', agendamentoCtrl.vagasRestantes);

module.exports = router;
