import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes/index';

const app = express();

app.use(morgan('dev'));
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/api', routes);

export default app;
