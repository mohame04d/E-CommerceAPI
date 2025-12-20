const app = require('./app');
const mongoose = require('mongoose');
const email = require('./utlis/email');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(db)
  .then(() => {
    console.log('database connected👍');
  })
  .catch(() => {
    console.log('database connection failed🤔');
  });

process.on('uncaughtException', (err) => {
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  server.close(() => {
    process.exit(1);
  });
});

app.listen(7000, () => {
  console.log('Good👌😎');
});
