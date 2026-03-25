
const Settings = require('../models/Settings');

class SettingsService {
    async getSettings() {
        let settings = await Settings.findOne();
        if (!settings) {
            settings = new Settings({});
            await settings.save();
        }
        return settings;
    }

    async updateSettings(settingsData) {
        return await Settings.findOneAndUpdate({}, settingsData, { new: true, upsert: true });
    }
}

module.exports = new SettingsService();
