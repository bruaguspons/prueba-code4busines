import express from 'express';
import cors from 'cors';
import salesRouter from './routes/sales';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/sales', salesRouter);

export { app };
