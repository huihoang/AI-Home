import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
dotenv.config();
import connectDB from "./config/db.js";
import router from './routes/routes.js';


const app = express();
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan());
app.use(router);

const PORT = process.env.PORT || 8080;

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})
