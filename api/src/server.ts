import express from 'express';
import router from './routes/routes';
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors({
    origin: 'http://localhost:3000'
  }));

app.use(express.json());
app.use('/api', router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});