import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// models
import User from './models/User.js';

dotenv.config();

const app = express();

// config JSON response
app.use(express.json());

// open route - public route
app.get('/', (req, res) => {
  res.status(200).json({ msg: 'Bem vindo a nossa API!' });
});

// register user
app.post('/auth/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  res.status(200).json({ msg: 'Autenticado!' });
});

// credentials
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

mongoose
  .connect(
    `mongodb+srv://${dbUser}:${dbPassword}@cluster0.qhw4k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(3000);
    console.log('Conectado ao MongoDB!');
  })
  .catch((err) => console.log(err));
