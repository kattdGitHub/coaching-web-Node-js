const { State } = require('../../models/location/State'); 

const stateList = async (req, res) => {
    try {
        const { row = 15, search } = req.query;
        const list = await _stateList(parseInt(row), search);
        return res.json({ success: true, message: 'State List get Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const _stateList = async (row, search = null) => {
    try {
        let query = { order: [['createdAt', 'DESC']], include: ['country_info'] };
        if (search) {
            query.where = { name: { [Sequelize.Op.like]: `%${search}%` } };
        }
        const list = await State.findAll(query);
        return list;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createState = async (req, res) => {
    try {
        const { name, country_id, state_code, latitude, longitude } = req.body;
        const stateExists = await State.findOne({ where: { name, country_id } });
        if (stateExists) {
            return res.status(400).json({ success: false, message: 'State Already Exists' });
        }
        const newState = await State.create({ name, country_id, state_code, latitude, longitude });
        const list = await _stateList(15, null);
        return res.json({ success: true, message: 'State Created Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateState = async (req, res) => {
    try {
        const { state_id, name, country_id, state_code, latitude, longitude } = req.body;
        const stateExists = await State.findOne({ where: { id: state_id } });
        if (!stateExists) {
            return res.status(404).json({ success: false, message: 'State Not Found' });
        }
        const updatedState = await State.update({ name, country_id, state_code, latitude, longitude }, { where: { id: state_id } });
        return res.json({ success: true, message: 'State Updated Successfully', data: updatedState });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteState = async (req, res) => {
    try {
        const { state_id } = req.body;
        const deletedState = await State.destroy({ where: { id: state_id } });
        if (!deletedState) {
            return res.status(404).json({ success: false, message: 'State Not Found' });
        }
        const list = await _stateList(15, null);
        return res.json({ success: true, message: 'State Deleted Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { stateList, createState, updateState, deleteState };
