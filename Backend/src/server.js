const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const app = express();

app.use(cors({
    origin: "https://ttcs-hospital-arrange-bed-web-8wv6.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(express.json());
// goij routes login
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
// goi routes users
const userRoutes = require('./routes/usersRoutes');
app.use('/api/users', userRoutes);
//goi routes khoa
const departmentRoutes = require('./routes/departmentRoutes');
app.use('/api/departments', departmentRoutes);

//goi routes admission
const admissionRoutes = require('./routes/admissionRoutes');
app.use('/api/admission', admissionRoutes);
//goi routes nurse
// GET /api/beds
const nurseTaskRoutes = require('./routes/nurseTaskRoutes');
app.use('/api', nurseTaskRoutes);


// api patient records

const patientRoutes = require('./routes/patientRoutes');
app.use('/api/patients', patientRoutes);


//api admin reports
const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);


const doctorRoutes = require('./routes/doctorRoutes');
app.use('/api/doctor', doctorRoutes);
const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Server đang chạy trên cổng ${PORT}`);
});