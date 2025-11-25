// maintenance-log-system-backend/models/maintenance.model.js

const mongoose = require('mongoose');

const workTypes = ['routine', 'preventive', 'predictive', 'breakdown', 'implementation'];
const statusTypes = ['pending', 'in progress', 'completed', 'verified']; 

const MaintenanceSchema = new mongoose.Schema({
    machine_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Machine', 
        required: false,
        default: null,
        index: true
    },
    machine_name: { type: String, default: null }, 
    reported_by: { type: String, default: null }, 
    reported_at: { type: Date, default: Date.now },
    completed_at: { type: Date, default: null },
    type: { type: String, enum: workTypes, default: 'routine' },
    note: { type: String, default: '' },
    reading_value: { type: mongoose.Schema.Types.Mixed, default: null }, 
    status: { type: String, enum: statusTypes, default: 'pending'},
    downtimeMinutes: { type: Number, default: 0 }, 
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }
}, {
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true }
});

MaintenanceSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

// Pre-save hook to calculate downtimeMinutes automatically
MaintenanceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    if (this.completed_at && this.reported_at) {
        const start = new Date(this.reported_at).getTime();
        const end = new Date(this.completed_at).getTime();
        const diff = (end - start) / (60 * 1000); 
        this.downtimeMinutes = Math.max(0, Math.round(diff));
    } else { this.downtimeMinutes = 0; }
    next();
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceSchema);