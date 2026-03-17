import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(env.port, () => {
  console.log(`API rodando em http://localhost:${env.port}`);
});
