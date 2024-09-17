/**
 * @module Package
 * @description Defines the schema for the Package model in the database.
 */

const mongoose = require('mongoose');

/**
 * @typedef {Object} Package
 * @property {string} packageId - Unique identifier for the package
 * @property {string} packageTitle - Title of the package
 * @property {number} packageWeight - Weight of the package
 * @property {string} packageDestination - Destination of the package
 * @property {string} packageDescription - Description of the package
 * @property {boolean} packageIsAllocated - Indicates if the package is allocated to a driver
 * @property {mongoose.Schema.Types.ObjectId} packageAssignedDriver - ID of the driver assigned to the package
 * @property {string} createdAt - Timestamp of when the package was created
 */

/**
 * Mongoose schema for the Package model
 * @type {mongoose.Schema}
 */
const packageSchema = new mongoose.Schema({ 
    packageId: {
        type: String,
        default: function() { return this.constructor.generatePackageId(); },
        unique: true,
    },
    packageTitle: {
        type: String,
        validate: {
            validator: function(title) {
                return /^[a-zA-Z0-9 ]+$/.test(title) && (title.length >= 3 && title.length <= 15);
            },
            message: 'Invalid title format. Package title should be between 3 and 15 characters.',
        },
        required: true,
    },
    packageWeight: {
        type: Number,
        validate: {
            validator: function(weight) {
                return !isNaN(weight) && Number.isInteger(weight) && weight >= 0;
            },
            message: 'Invalid weight format. Package weight should be a positive integer.',
        },
        required: true,
    },
    packageDestination: {
        type: String,
        validate: {
            validator: function(destination) {
                return /^[a-zA-Z0-9 ]+$/.test(destination) && (destination.length >= 5 && destination.length <= 15);
            },
            message: 'Invalid destination format. Package destination should be between 5 and 15 characters.',
        },
        required: true,
    },
    packageDescription: {
        type: String,
        validate: {
            validator: function(description) {
                return description.length >= 0 && description.length <= 30;
            },
            message: 'Invalid description format. Package description should be between 0 and 30 characters.',
        },
        required: true,
    },
    packageIsAllocated: {
        type: Boolean,
        required: true,
    },
    packageAssignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    createdAt: {
        type: String,
        default: function() {
            return new Date().toLocaleString();
        }
    },
});

/**
 * Generates a unique identifier for the package.
 * The format is "P[twoRandomLetters]-SB-[randomDigits]".
 * @returns {string} A unique identifier for the package.
 * @private
 */
packageSchema.statics.generatePackageId = function() {
    let randomDigits = Math.floor(Math.random() * 1000);
    let stuInitials = "SB";
    let twoRandLetters = this.generateRandomLetters();
    return "P" + twoRandLetters + "-" + stuInitials + "-" + randomDigits;
}

/**
 * Generates two random uppercase letters.
 * @returns {string} A string containing two random uppercase letters.
 * @private
 */
packageSchema.statics.generateRandomLetters = function() {
    let letters = "";
    for (let i = 0; i < 2; i++){
        letters += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    }
    return letters;
}

module.exports = mongoose.model('Package', packageSchema);