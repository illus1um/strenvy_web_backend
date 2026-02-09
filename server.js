require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
const exercisesRoutes = require('./routes/exercises');
const programsRoutes = require('./routes/programs');
const workoutsRoutes = require('./routes/workouts');
const historyRoutes = require('./routes/history');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

app.use('/api/exercises', exercisesRoutes);
app.use('/api/programs', programsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/users', require('./routes/users'));

app.get('/', (req, res) => {
    res.send('Strenvy Backend API is running');
});

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
