const { City } = require('../../models/location/City'); // Assuming you have defined your City model in a separate file

const cityList = async (req, res) => {
    try {
        const { row = 15, search } = req.query;
        const list = await _cityList(parseInt(row), search);
        return res.json({ success: true, message: 'City List get Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const _cityList = async (row, search = null) => {
    try {
        let query = { order: [['createdAt', 'DESC']] };
        if (search) {
            query.where = { name: { [Sequelize.Op.like]: `%${search}%` } };
        }
        const list = await City.findAll(query);
        return list;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createCity = async (req, res) => {
    try {
        const { name, country_id, state_id, latitude, longitude } = req.body;
        const cityExists = await City.findOne({ where: { name, country_id, state_id } });
        if (cityExists) {
            return res.status(400).json({ success: false, message: 'City Already Exists' });
        }
        const newCity = await City.create({ name, country_id, state_id, latitude, longitude });
        const list = await _cityList(15, null);
        return res.json({ success: true, message: 'City Created Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateCity = async (req, res) => {
    try {
        const { city_id, name, country_id, state_id, latitude, longitude } = req.body;
        const cityExists = await City.findOne({ where: { id: { [Sequelize.Op.ne]: city_id }, name, country_id, state_id } });
        if (cityExists) {
            return res.status(400).json({ success: false, message: 'City Already Exists' });
        }
        const updatedCity = await City.update({ name, country_id, state_id, latitude, longitude }, { where: { id: city_id } });
        return res.json({ success: true, message: 'City Updated Successfully', data: updatedCity });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCity = async (req, res) => {
    try {
        const { city_id } = req.body;
        const deletedCity = await City.destroy({ where: { id: city_id } });
        if (!deletedCity) {
            return res.status(404).json({ success: false, message: 'City Delete Info Not Found' });
        }
        const list = await _cityList(15, null);
        return res.json({ success: true, message: 'City Deleted Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { cityList, createCity, updateCity, deleteCity };
