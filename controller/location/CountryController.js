const { Country } = require('../../models/location/Country'); // Assuming you have defined your Country model in a separate file

const countryList = async (req, res) => {
    try {
        const { row = 15, search } = req.query;
        const list = await _countryList(parseInt(row), search);
        return res.json({ success: true, message: 'Country List get Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const _countryList = async (row, search = null) => {
    try {
        let query = { order: [['createdAt', 'DESC']] };
        if (search) {
            query.where = { name: { [Sequelize.Op.like]: `%${search}%` } };
        }
        const list = await Country.findAll(query);
        return list;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createCountry = async (req, res) => {
    try {
        const { name, iso3, region, nationality, iso2, numeric_code, phone_code, capital, currency, currency_name, currency_symbol, latitude, longitude, emoji } = req.body;
        const countryExists = await Country.findOne({ where: { name, iso3, region } });
        if (countryExists) {
            return res.status(400).json({ success: false, message: 'Country Already Exists' });
        }
        const newCountry = await Country.create({ name, iso3, iso2, numeric_code, phone_code, capital, currency, currency_name, currency_symbol, nationality, latitude, longitude, emoji, region });
        const list = await _countryList(15, null);
        return res.json({ success: true, message: 'Country Created Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateCountry = async (req, res) => {
    try {
        const { country_id, name, iso3, region, nationality, iso2, numeric_code, phone_code, capital, currency, currency_name, currency_symbol, latitude, longitude, emoji } = req.body;
        const countryExists = await Country.findOne({ where: { id: { [Sequelize.Op.ne]: country_id }, name, iso3, region } });
        if (countryExists) {
            return res.status(400).json({ success: false, message: 'Country Already Exists' });
        }
        const updatedCountry = await Country.update({ name, iso3, iso2, numeric_code, phone_code, capital, currency, currency_name, currency_symbol, nationality, latitude, longitude, emoji, region }, { where: { id: country_id } });
        return res.json({ success: true, message: 'Country Updated Successfully', data: updatedCountry });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCountry = async (req, res) => {
    try {
        const { country_id } = req.body;
        const deletedCountry = await Country.destroy({ where: { id: country_id } });
        if (!deletedCountry) {
            return res.status(404).json({ success: false, message: 'Country Delete Info Not Found' });
        }
        const list = await _countryList(15, null);
        return res.json({ success: true, message: 'Country Deleted Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { countryList, createCountry, updateCountry, deleteCountry };
