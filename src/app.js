const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const multer = require('multer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: true,
}));

const authRoutes = require('./routes/auth');
const v1Routes = require('./routes/api/v1');
const v2Routes = require('./routes/api/v2');

// Basic route
app.get('/', (req, res) => {
  res.send('CareerOS API is running');
});

app.use('/auth', authRoutes);
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

module.exports = app;
