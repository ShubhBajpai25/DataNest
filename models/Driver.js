/**
 * @module Driver
 * @description Defines the schema for the Driver model in the database.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Driver
 * @property {string} driverId - Unique identifier for the driver
 * @property {string} driverName - Name of the driver
 * @property {string} driverDepartment - Department the driver belongs to
 * @property {string} driverLicense - Driver's license number
 * @property {Array.<mongoose.Schema.Types.ObjectId>} assigned_packages - Array of package IDs assigned to the driver
 * @property {boolean} driverIsActive - Indicates if the driver is currently active
 * @property {string} driverCreatedAt - Timestamp of when the driver was created
 */

/**
 * Mongoose schema for the Driver model
 * @type {mongoose.Schema}
 */
const driverSchema = new mongoose.Schema({
    driverId: {
        type: String,
        default: function() { return this.constructor.generateDriverId(); },
        unique: true,
    },
    driverName: {
        type: String,
        validate: {
            validator: function(name) {
                return /^[a-zA-Z\s ]+$/.test(name) && (name.length >= 3 && name.length <= 20);
            },
            message: 'Invalid name format. Driver name should be between 3 and 20 characters.',
        },
        required: true,
    },
    driverDepartment: {
        type: String,
        required: true,
        validate: {
            validator: function(department) {
                return ['Food', 'Electronic', 'Furniture'].includes(department);
            },
            message: 'Invalid department. Driver department should be Food, Electronic, or Furniture.',
        },
    },
    driverLicense: {
        type: String,
        validate: {
            validator: function(license) {
                return /^[a-zA-Z0-9]+$/.test(license) && license.length == 5;
            },
            message: 'Invalid license format. Driver license should be alphanumeric and equal to 5 characters.',
        },
        required: true,
    },
    assigned_packages: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        },
    ],
    driverIsActive: {
        type: Boolean,
        required: true,
    },
    driverCreatedAt: {
        type: String,
        default: function() {
            return new Date().toLocaleString();
        }
    },
});

/**
 * Generates a unique identifier for the driver.
 * The format is "D[randomDigits]-33-[threeRandomLetters]".
 * @returns {string} A unique identifier for the driver.
 * @private
 */
driverSchema.statics.generateDriverId = function() {
    let randomDigits = Math.floor(Math.random() * 100);
    let stuId = 33;
    let threeRandLetters = this.generateRandomLetters();
    return "D" + randomDigits + "-" + stuId + "-" + threeRandLetters;
}

/**
 * Generates three random uppercase letters.
 * @returns {string} A string containing three random uppercase letters.
 * @private
 */
driverSchema.statics.generateRandomLetters = function() {
    let letters = '';
    for (let i = 0; i < 3; i++){
        letters += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }
    return letters;
}

module.exports = mongoose.model('Driver', driverSchema);