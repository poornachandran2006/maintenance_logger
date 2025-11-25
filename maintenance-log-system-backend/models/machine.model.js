// maintenance-log-system-backend/models/machine.model.js

const mongoose = require('mongoose');

const MachineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: false },
    status: { type: String, enum: ['running', 'idle', 'maintenance'], default: 'idle' },
    location: { type: String, required: false },
    last_active_at: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
}, {
    // Allows us to use _id as id for frontend compatibility
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

MachineSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

module.exports = mongoose.model('Machine', MachineSchema);