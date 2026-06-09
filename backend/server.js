const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/employees', require('./routes/employees'));
app.use('/api/finance', require('./routes/finance'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/workbench', require('./routes/workbench'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/users', require('./routes/users'));
app.use('/api/messages', require('./routes/messages'));

app.get('/', (req, res) => res.json({ message: 'Mini SAP ERP API running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Use a different PORT or stop the running process.`);
        process.exit(1);
      }
      throw error;
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
