import express from 'express';
import { PORT } from './src/config.js';
import { UserRepository } from './user-repositorty.js';


const app = express();

app.use(express.json())
app.get('/', (req, res) => {
    res.send('Hello, integradora!');
});

app.post('/login', (req, res) => {
    // Aquí iría la lógica de autenticación
    res.send('Login endpoint');
});
app.post('/register', (req, res) => {
    // Aquí iría la lógica de autenticación
    const { username, password } = req.body
    console.log(req.body)
    try {
        const id = UserRepository.create({ username, password })
        res.send({ id })
    } catch (error) {
        res.status(400).send(error.message)
    }
});


app.post('/logout', (req, res) => {
    // Aquí iría la lógica de autenticación
    res.send('Logout endpoint');
});

app.post('/protected', (req, res) => {
    // Aquí iría la lógica de autenticación
    res.send('Protected endpoint');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


