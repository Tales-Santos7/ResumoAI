import dotenv from "dotenv";
dotenv.config();
import express from 'express';
import cors from 'cors';
import SummaryWithIARouter from './routers/SummaryWithIA.routes.js';

const app = express();

app.use(express.json());

// ✅ CORS aberto (funciona local e deploy)
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
}));

app.get('/', (req, res) => {
  res.status(200).json("SERVIDOR OK.");
  res.status(200).json("RODANDO EM https://resumo-ai.vercel.app/");
});

app.use('/resume', SummaryWithIARouter);

export default app;
