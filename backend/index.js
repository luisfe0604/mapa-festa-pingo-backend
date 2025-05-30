require('dotenv').config();
const express = require('express');
const db = require('./db');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('frontend'));
app.use(cors()); 

app.use(express.json());

app.get('/api/mesas', async (req, res) => {

  const result = await db.query('SELECT * FROM mesas ORDER BY id');
  res.json(result.rows);
});

app.post('/api/mesas/:id/reservar', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10) + 1;
    const { nome, cadeiras } = req.body;
 console.log(nome, cadeiras, id)
    if (!nome || !cadeiras) {
      return res.status(400).json({ error: 'Nome e número de cadeiras são obrigatórios.' });
    }

    const result = await db.query(
      'UPDATE mesas SET nome = $1, cadeiras = $2, ocupada = true WHERE id = $3 AND ocupada = false RETURNING *',
      [nome, cadeiras, id]
    );

    if (result.rowCount === 0) {
      return res.status(409).json({ error: 'Mesa já está ocupada ou não existe.' });
    }

    res.status(200).json({ message: 'Mesa reservada com sucesso.', mesa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao reservar mesa:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


app.put('/api/mesas/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10) + 1;
    const { nome, cadeiras } = req.body;

    if (!nome || !cadeiras) {
      return res.status(400).json({ error: 'Nome e número de cadeiras são obrigatórios.' });
    }

    const result = await db.query(
      'UPDATE mesas SET nome = $1, cadeiras = $2, ocupada = true WHERE id = $3 RETURNING *',
      [nome, cadeiras, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mesa não encontrada.' });
    }

    res.status(200).json({ message: 'Mesa atualizada com sucesso.', mesa: result.rows[0] });
  } catch (error) {
    console.error('Erro ao atualizar mesa:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});


app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));