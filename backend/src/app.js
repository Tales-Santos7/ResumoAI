import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import SummaryWithIARouter from './routers/SummaryWithIA.routes.js'

const app = express()

//Conecta ao banco de dados
// connectDB()

app.use(express.json())

// Middleware para resolver erro CORS

app.use(cors({
  origin: "*", // Permite qualquer origem
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Isto responde automaticamente a qualquer preflight
app.options("*", cors());

app.get('/', (req, res) => {
    res.status(200).json("SERVIDOR OK")
})

app.use('/resume', SummaryWithIARouter)

export default app