const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');

const User = require('./models/User');
const Exercise = require('./models/Exercise');
const Program = require('./models/Program');
const Workout = require('./models/Workout');
const History = require('./models/History');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/strenvy';
const DATA_DIR = path.join(__dirname, 'data');

const readJSON = async (filename) => {
    try {
        const filePath = path.join(DATA_DIR, filename);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
};

const migrate = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Migrate Users
        const users = await readJSON('users.json');
        if (users.length > 0) {
            await User.deleteMany({});
            for (const user of users) {
                const { id, ...userData } = user;
                await User.create(userData);
            }
            console.log(`Migrated ${users.length} users`);
        } else {
            console.log('No users to migrate');
        }

        // Migrate Exercises
        const exercises = await readJSON('exercises.json');
        if (exercises.length > 0) {
            await Exercise.deleteMany({});
            const batchSize = 500;
            for (let i = 0; i < exercises.length; i += batchSize) {
                const batch = exercises.slice(i, i + batchSize);
                await Exercise.insertMany(batch);
                console.log(`  Exercises batch ${Math.floor(i / batchSize) + 1}: ${batch.length} inserted`);
            }
            console.log(`Migrated ${exercises.length} exercises`);
        } else {
            console.log('No exercises to migrate');
        }

        // Migrate Programs
        const programs = await readJSON('programs.json');
        if (programs.length > 0) {
            await Program.deleteMany({});
            for (const program of programs) {
                const { id, ...programData } = program;
                await Program.create(programData);
            }
            console.log(`Migrated ${programs.length} programs`);
        } else {
            console.log('No programs to migrate');
        }

        // Migrate Workouts
        const workouts = await readJSON('workouts.json');
        if (workouts.length > 0) {
            await Workout.deleteMany({});
            for (const workout of workouts) {
                const { id, ...workoutData } = workout;
                await Workout.create(workoutData);
            }
            console.log(`Migrated ${workouts.length} workouts`);
        } else {
            console.log('No workouts to migrate');
        }

        // Migrate History
        const history = await readJSON('history.json');
        if (history.length > 0) {
            await History.deleteMany({});
            for (const entry of history) {
                const { id, ...entryData } = entry;
                await History.create(entryData);
            }
            console.log(`Migrated ${history.length} history entries`);
        } else {
            console.log('No history to migrate');
        }

        console.log('\nMigration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

migrate();
