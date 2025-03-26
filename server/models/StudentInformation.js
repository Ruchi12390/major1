// server/models/StudentInformation.js
const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize');  // Importing from the correct file

const StudentInformation = sequelize.define('StudentInformation', {
    s_no: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // Automatically increments for each new entry
        primaryKey: true, // Set as primary key
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    enrollment: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    semester: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = StudentInformation;
