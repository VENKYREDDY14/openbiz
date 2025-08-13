import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registrationRoutes from './routes/registrationRoutes';

dotenv.config();
const app = express();

app.use(cors({
  origin: 'https://openbiz-beta.vercel.app'
}));
app.use(express.json());
app.use('/api', registrationRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
