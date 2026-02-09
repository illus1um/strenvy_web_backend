const express = require('express');
const router = express.Router();
const Program = require('../models/Program');

const DEFAULT_ADMIN_PROGRAMS = [
    {
        name: 'Beginner Full Body',
        description: 'Perfect for beginners. 3 days per week, focusing on full body compound movements.',
        duration: 4,
        daysPerWeek: ['monday', 'wednesday', 'friday'],
        difficulty: 'beginner',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Full Body A',
                exercises: [
                    { id: '0001', name: '3/4 sit-up', sets: 3, reps: 15, rest: 60 },
                    { id: '0002', name: '45° side bend', sets: 3, reps: 12, rest: 60 },
                    { id: '0003', name: 'air bike', sets: 3, reps: 20, rest: 45 },
                ]
            },
            wednesday: {
                name: 'Full Body B',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0005', name: 'alternate heel touchers', sets: 3, reps: 20, rest: 45 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            friday: {
                name: 'Full Body C',
                exercises: [
                    { id: '0007', name: 'ankle circles', sets: 3, reps: 15, rest: 30 },
                    { id: '0008', name: 'archer pull up', sets: 3, reps: 8, rest: 120 },
                    { id: '0009', name: 'archer push up', sets: 3, reps: 10, rest: 90 },
                ]
            },
        },
    },
    {
        name: 'Push Pull Legs',
        description: 'Classic PPL split for intermediate lifters. 6 days per week for maximum gains.',
        duration: 8,
        daysPerWeek: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
        difficulty: 'intermediate',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Push Day',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 10, rest: 90 },
                    { id: '0010', name: 'arm slingers hanging bent knee legs', sets: 3, reps: 12, rest: 60 },
                ]
            },
            tuesday: {
                name: 'Pull Day',
                exercises: [
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 8, rest: 120 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            wednesday: {
                name: 'Legs Day',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 15, rest: 60 },
                ]
            },
            thursday: {
                name: 'Push Day',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 12, rest: 90 },
                ]
            },
            friday: {
                name: 'Pull Day',
                exercises: [
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 10, rest: 120 },
                ]
            },
            saturday: {
                name: 'Legs Day',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 4, reps: 15, rest: 60 },
                ]
            },
        },
    },
    {
        name: 'Upper Lower Split',
        description: 'Balanced upper/lower body training. Great for building strength and muscle.',
        duration: 6,
        daysPerWeek: ['monday', 'tuesday', 'thursday', 'friday'],
        difficulty: 'intermediate',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Upper Body A',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 10, rest: 90 },
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 8, rest: 120 },
                    { id: '0006', name: 'alternate lateral pulldown', sets: 3, reps: 12, rest: 90 },
                ]
            },
            tuesday: {
                name: 'Lower Body A',
                exercises: [
                    { id: '0004', name: 'all fours squad stretch', sets: 3, reps: 15, rest: 60 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 20, rest: 45 },
                    { id: '0002', name: '45° side bend', sets: 3, reps: 15, rest: 60 },
                ]
            },
            thursday: {
                name: 'Upper Body B',
                exercises: [
                    { id: '0009', name: 'archer push up', sets: 4, reps: 12, rest: 90 },
                    { id: '0008', name: 'archer pull up', sets: 4, reps: 10, rest: 120 },
                ]
            },
            friday: {
                name: 'Lower Body B',
                exercises: [
                    { id: '0003', name: 'air bike', sets: 4, reps: 25, rest: 45 },
                    { id: '0005', name: 'alternate heel touchers', sets: 3, reps: 20, rest: 45 },
                ]
            },
        },
    },
    {
        name: 'Core Crusher',
        description: 'Intensive ab and core workout. 3 days per week for a rock-solid midsection.',
        duration: 4,
        daysPerWeek: ['monday', 'wednesday', 'friday'],
        difficulty: 'advanced',
        isAdmin: true,
        schedule: {
            monday: {
                name: 'Core Blast',
                exercises: [
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 25, rest: 45 },
                    { id: '0002', name: '45° side bend', sets: 4, reps: 20, rest: 45 },
                    { id: '0003', name: 'air bike', sets: 4, reps: 30, rest: 30 },
                    { id: '0005', name: 'alternate heel touchers', sets: 4, reps: 25, rest: 45 },
                ]
            },
            wednesday: {
                name: 'Ab Ripper',
                exercises: [
                    { id: '0003', name: 'air bike', sets: 5, reps: 30, rest: 30 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 30, rest: 45 },
                ]
            },
            friday: {
                name: 'Core Finisher',
                exercises: [
                    { id: '0002', name: '45° side bend', sets: 5, reps: 25, rest: 45 },
                    { id: '0005', name: 'alternate heel touchers', sets: 5, reps: 30, rest: 30 },
                    { id: '0001', name: '3/4 sit-up', sets: 4, reps: 25, rest: 45 },
                ]
            },
        },
    },
];

const seedAdminPrograms = async () => {
    const adminCount = await Program.countDocuments({ isAdmin: true });
    if (adminCount === 0) {
        await Program.insertMany(DEFAULT_ADMIN_PROGRAMS);
    }
};

// GET /api/programs
router.get('/', async (req, res) => {
    try {
        await seedAdminPrograms();
        const programs = await Program.find().lean();
        const result = programs.map(p => {
            p.id = p._id;
            delete p._id;
            delete p.__v;
            if (p.schedule instanceof Map) {
                p.schedule = Object.fromEntries(p.schedule);
            }
            return p;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch programs' });
    }
});

// POST /api/programs
router.post('/', async (req, res) => {
    try {
        const program = await Program.create(req.body);
        const obj = program.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.status(201).json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create program' });
    }
});

// PUT /api/programs/:id
router.put('/:id', async (req, res) => {
    try {
        const program = await Program.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        const obj = program.toObject();
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
        res.json(obj);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update program' });
    }
});

// DELETE /api/programs/:id
router.delete('/:id', async (req, res) => {
    try {
        const program = await Program.findByIdAndDelete(req.params.id);
        if (!program) {
            return res.status(404).json({ error: 'Program not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete program' });
    }
});

// POST /api/programs/reset
router.post('/reset', async (req, res) => {
    try {
        await Program.deleteMany({ isAdmin: true });
        const inserted = await Program.insertMany(DEFAULT_ADMIN_PROGRAMS);
        const result = inserted.map(p => {
            const obj = p.toObject();
            obj.id = obj._id;
            delete obj._id;
            delete obj.__v;
            return obj;
        });
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset admin programs' });
    }
});

module.exports = router;
