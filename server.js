const express = require('express');
const amqp = require('amqplib');
const mysql = require('mysql2/promise'); 

const app = express();
app.use(express.json());

const RABBITMQ_URL = "amqp://guest:guest@localhost:5672";
const QUEUE = 'user_signup';

// Configuration de la connexion MySQL
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'password',
    database: process.env.DB_NAME || 'mydatabase'
});

// Fonction pour connecter à RabbitMQ et envoyer le message
async function publishToQueue(queue, message) {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log("Message sent to RabbitMQ", message);
    await channel.close();
    await connection.close();
}

// Route d'inscription d'utilisateur
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  try {
      const [rows] = await pool.execute('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password]);
      
      const newUser = {
          id: rows.insertId,
          username,
          email
      };

      // Publier un message dans RabbitMQ
      await publishToQueue(QUEUE, newUser);

      res.status(201).json({ message: 'User signed up successfully', user: newUser });
  } catch (error) {
      console.error('Error during database operation:', error);
      res.status(500).json({ message: 'Error during user signup',  error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Producer API running on port ${PORT}`);
});
