const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
  console.error('Erro ao carregar .env:', result.error);
} else {
  console.log('Variáveis carregadas:', result.parsed);
  console.log('MONGO_URI:', process.env.MONGO_URI);
}

