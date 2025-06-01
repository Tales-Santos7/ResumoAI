import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import SummaryWithIARouter from './routers/SummaryWithIA.routes.js'

const app = express()

//Conecta ao banco de dados
// connectDB()

app.use(express.json())

// Middleware para resolver erro CORS

const allowedOrigins = [
  'http://localhost:5173',
  'https://resumo-ai.vercel.app', // <- substitui se tiver domínio custom
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("Origem recebida:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Origem não permitida por CORS'));
    }
  },
  credentials: true,
}));

app.get('/', (req, res) => {
    res.status(200).json("SERVIDOR OK")
})

app.use('/resume', SummaryWithIARouter)

export default app