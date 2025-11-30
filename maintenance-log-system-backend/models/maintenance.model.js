// maintenance-log-system-backend/models/maintenance.model.js

const mongoose = require('mongoose');

const workTypes = ['routine', 'preventive', 'predictive', 'breakdown', 'implementation'];
const statusTypes = ['pending', 'in progress', 'completed', 'verified'];

const MaintenanceSchema = new mongoose.Schema({

    /* ==========================================
       🔗 WORKER + SHIFT RELATIONS  
       ========================================== */
    worker_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    worker_name: { type: String, default: null }, 

    shift_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shift",
        default: null
    },

    /* ==========================================
       🔗 MACHINE RELATION  
       ========================================== */
    machine_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        default: null,
        index: true
    },
    machine_name: { type: String, default: null },

    /* ==========================================
       📅 TIMESTAMP FIELDS  
       ========================================== */
    reported_by: { type: String, default: null },
    reported_at: { type: Date, default: Date.now },
    completed_at: { type: Date, default: null },

    /* ==========================================
       📄 MAIN LOG DETAILS  
       ========================================== */
    type: { type: String, enum: workTypes, default: 'routine' },
    note: { type: String, default: '' },
    reading_value: { type: mongoose.Schema.Types.Mixed, default: null },

    /* ==========================================
       📌 STATUS  
       ========================================== */
    status: { type: String, enum: statusTypes, default: 'pending' },

    /* ==========================================
       ⏳ DOWNTIME CALC  
       ========================================== */
    downtimeMinutes: { type: Number, default: 0 },

    /* ==========================================
       🕒 TRACKING  
       ========================================== */
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

/* ==========================================
   🔗 PUBLIC ID
   ========================================== */
MaintenanceSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

/* ==========================================
   🔧 DOWNTIME AUTO-CALC
   ========================================== */
MaintenanceSchema.pre('save', function (next) {
    this.updatedAt = Date.now();

    if (this.completed_at && this.reported_at) {
        const start = new Date(this.reported_at).getTime();
        const end = new Date(this.completed_at).getTime();
        const diff = (end - start) / 60000; // minutes
        this.downtimeMinutes = Math.max(0, Math.round(diff));
    } else {
        this.downtimeMinutes = 0;
    }

    next();
});

module.exports = mongoose.model('MaintenanceLog', MaintenanceSchema);
