
const settingsService = require('../services/settings.service');

class SettingsController {
    async getSettings(req, res) {
        try {
            const settings = await settingsService.getSettings();
            res.json({ success: true, result: settings });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async updateSettings(req, res) {
        try {
            const settings = await settingsService.updateSettings(req.body);
            res.json({ success: true, result: settings });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new SettingsController();
