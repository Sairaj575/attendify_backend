const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');


const app = express();

app.use(cors());
app.use(express.json());
connectDB() ;

app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/teacher', require('./src/routes/teacherRoutes') );
app.use('/api/student', require('./src/routes/studentRoutes') );

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
