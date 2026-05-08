import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import router from './routes';
import errorhandler from './middlewares/errorHandler.js';



//app initialization
const app = express();
const PORT = process.env.PORT || 3000;      //defult port is 3000 if not specified in env

//middlewares
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',  //cros origin from env or default to localhost:3000
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(morgan('dev'));


//Gloable rate limiter
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

//health check endpoint without authentication
app.get('/health',(req, res) =>{
    res.status(200).json({'status': 'ok'});
});

app.use('/api/v1', router);








//error handling middelware
app.use((errorhandler));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
