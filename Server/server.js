require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path')

const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Client", "dist")))

// Routes
const healthRouter = require('./Routes/healthRouter');
const diplomacyRouter = require('./Routes/diplomacyRouter');
const battleRouter = require('./Routes/battleRouter');
const authRouter = require('./Routes/authRouter');

app.use('/api/health', healthRouter);
app.use('/api/diplomacy', diplomacyRouter);
app.use('/api/battle', battleRouter);
app.use('/api/auth', authRouter);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');

    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "../Client", "dist", "index.html")))
    
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error('MongoDB connection error:', err));
