const mongoose = require('mongoose');
const AnnouncementSchema = require('../schemas/announcement.schema');

module.exports = mongoose.model('Announcement', AnnouncementSchema);
