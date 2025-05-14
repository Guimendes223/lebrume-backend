const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  console.log("Requisição recebida em /api/health");
  console.log(req.method, req.url); // Exibe o método e URL da requisição
  res.json({ status: 'ok', message: 'API está saudável' });
});

app.get('/', (req, res) => {
  res.send('Welcome to Lebrume.com.au API.');
});

app.listen(8080, () => {
  console.log('Servidor rodando na porta 8080');
});
