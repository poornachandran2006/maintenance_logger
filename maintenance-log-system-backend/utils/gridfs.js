const mongoose = require('mongoose');
const { GridFSBucket } = require('mongodb');

let gsf;

mongoose.connection.once('open', () => {
    gsf = new GridFSBucket(mongoose.connection.db, {
        bucketName: 'csvFiles'
    });
});

const getGFS = () => gsf;

module.exports = getGFS;