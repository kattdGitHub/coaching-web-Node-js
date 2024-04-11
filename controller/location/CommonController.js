const Country = require('../../models/location/Country');
const State = require('../../models/location/State');
const City = require('../../models/location/City');
const Course = require('../../models/location/Course');

const countryOption = async (req, res) => {
    try {
        const { search } = req.query;
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};
        const list = await Country.find(query).sort({ createdAt: 1 }).limit(50);
        return res.json({ success: true, message: 'Country Option List Get Successfully', data: { list } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const stateOption = async (req, res) => {
    try {
        const { country_id, search } = req.query;
        const query = { country_id };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const list = await State.find(query).sort({ createdAt: 1 }).limit(50);
        return res.json({ success: true, message: 'State Option List Get Successfully', data: { list } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const cityOption = async (req, res) => {
    try {
        const { country_id, state_id, search } = req.query;
        const query = { country_id, state_id };
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const list = await City.find(query).sort({ createdAt: 1 }).limit(50);
        return res.json({ success: true, message: 'City Option List Get Successfully', data: { list } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const courseOption = async (req, res) => {
    try {
        const { search } = req.query;
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};
        const list = await Course.find(query).sort({ createdAt: 1 }).limit(50);
        return res.json({ success: true, message: 'Course Option List Get Successfully', data: { list } });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { countryOption, stateOption, cityOption, courseOption, };
