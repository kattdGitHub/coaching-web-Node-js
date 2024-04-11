const { Course } = require('../../models/location/Course'); // Assuming you have defined your Course model in a separate file

const courseList = async (req, res) => {
    try {
        const { row = 15, search } = req.query;
        const list = await _courseList(parseInt(row), search);
        return res.json({ success: true, message: 'Course List get Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const _courseList = async (row, search = null) => {
    try {
        let query = { order: [['createdAt', 'DESC']] };
        if (search) {
            query.where = { name: { [Sequelize.Op.like]: `%${search}%` } };
        }
        const list = await Course.findAll(query);
        return list;
    } catch (error) {
        throw new Error(error.message);
    }
};

const createCourse = async (req, res) => {
    try {
        const { name, description, icon } = req.body;
        const courseExists = await Course.findOne({ where: { name } });
        if (courseExists) {
            return res.status(400).json({ success: false, message: 'Course Already Exists' });
        }
        const newCourse = await Course.create({ name, description, icon });
        const list = await _courseList(15, null);
        return res.json({ success: true, message: 'Course Created Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateCourse = async (req, res) => {
    try {
        const { course_id, name, description, icon } = req.body;
        const courseExists = await Course.findOne({ where: { id: { [Sequelize.Op.ne]: course_id }, name } });
        if (courseExists) {
            return res.status(400).json({ success: false, message: 'Course Already Exists' });
        }
        const updatedCourse = await Course.update({ name, description, icon }, { where: { id: course_id } });
        return res.json({ success: true, message: 'Course Updated Successfully', data: updatedCourse });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const deleteCourse = async (req, res) => {
    try {
        const { course_id } = req.body;
        const deletedCourse = await Course.destroy({ where: { id: course_id } });
        if (!deletedCourse) {
            return res.status(404).json({ success: false, message: 'Course Delete Info Not Found' });
        }
        const list = await _courseList(15, null);
        return res.json({ success: true, message: 'Course Deleted Successfully', data: list });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { courseList, createCourse, updateCourse, deleteCourse };
