
const User = require('../models/user.model');
const { Parser } = require('json2csv');
const getGFS = require('../utils/gridfs');

const signup = async (req, res) => {
    try {
        const {
            email, password, shiftNumber, requestedBy, department,
            maintenanceType, complaintNature, startTime, finishTime
        } = req.body;

        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = finishTime.split(':').map(Number);

        let totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        if (totalMinutes < 0) totalMinutes += 1440;

        const newUser = new User({
            email,
            password,
            shiftNumber,
            requestedBy,
            department,
            maintenanceType,
            complaintNature,
            startTime,
            finishTime,
            totalMinutes,
        });

        await newUser.save();

        const fields = [
            'email', 'shiftNumber', 'requestedBy', 'department',
            'maintenanceType', 'complaintNature', 'startTime',
            'finishTime', 'totalMinutes', 'createdAt'
        ];
        const parser = new Parser({ fields });
        const csvData = parser.parse({
            ...newUser.toObject(),
            createdAt: new Date().toISOString()
        });

        const gfs = getGFS();
        if (!gfs) return res.status(500).json({ error: 'GridFS not initialized' });

        const uploadStream = gfs.openUploadStream(`log_${Date.now()}.csv`, {
            contentType: 'text/csv'
        });

        uploadStream.write(csvData);
        uploadStream.end();

        uploadStream.on('finish', () => {
            res.status(201).json({ message: 'User saved and CSV stored in DB' });
        });

        uploadStream.on('error', (err) => {
            console.error('Upload to GridFS failed:', err);
            res.status(500).json({ error: 'CSV upload failed' });
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong during signup' });
    }
};

const signin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, password });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ message: 'Login successful', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong during signin' });
    }
};

const logout = async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ error: 'Logout failed' });
            }
            // Clear the session cookie
            res.clearCookie('connect.sid'); 
            res.status(200).json({ message: 'Logout successful', authenticated: false });
        });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ error: 'Something went wrong during logout' });
    }
};
  

module.exports = { signup, signin, logout };