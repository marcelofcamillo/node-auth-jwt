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

  // validations
  if (!name) return res.status(422).json({ msg: 'O nome é obrigatório!' });
  if (!email) return res.status(422).json({ msg: 'O e-mail é obrigatório!' });
  if (!password) return res.status(422).json({ msg: 'A senha é obrigatória!' });
  if (password !== confirmPassword)
    return res.status(422).json({ msg: 'As senhas não conferem!' });

  // check if user exists
  const userExists = await User.findOne({ email: email });

  if (userExists)
    return res.status(422).json({ msg: 'Por favor, utilize outro e-mail!' });

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create user
  const user = new User({ name, email, password: passwordHash });

  try {
    await user.save();

    res.status(201).json({ msg: 'Usuário criado com sucesso!' });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: 'Erro no sevidor, tente novamente mais tarde!' });
  }
});

// login user
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  // validations
  if (!email) return res.status(422).json({ msg: 'O e-mail é obrigatório!' });
  if (!password) return res.status(422).json({ msg: 'A senha é obrigatória!' });

  // check if user exists
  const user = await User.findOne({ email: email });

  if (!user) return res.status(422).json({ msg: 'Usuário não encontrado!' });

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) return res.status(422).json({ msg: 'Senha inválida!' });

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign({ id: user._id }, secret);

    res.status(200).json({ msg: 'Autenticação realizada com sucesso', token });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ msg: 'Erro no sevidor, tente novamente mais tarde!' });
  }
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
