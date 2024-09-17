const express = require('express');
const driverController = require('../controllers/driver-controller');

const router = express.Router();

/**
 * Add a new driver.
 * @route POST /add
 * @access Protected (requires authentication)
 * @middleware userAuthenticate
 * @body {Object} req.body - Driver data (driverName, driverDepartment, driverLicense, driverIsActive)
 * @returns {Object} 200 - Driver ID and status of the addition
 * @returns {Object} 500 - Error message if addition fails
 */
router.post("/add", driverController.userAuthenticate, driverController.addDriver);

/**
 * Delete a driver by ID.
 * @route DELETE /delete
 * @access Protected (requires authentication)
 * @middleware userAuthenticate
 * @query {string} id - Driver ID to delete
 * @returns {Object} 200 - Confirmation of deletion and deleted count
 * @returns {Object} 404 - Driver not found
 * @returns {Object} 500 - Error message if deletion fails
 */
router.delete("/delete", driverController.userAuthenticate, driverController.deleteDriver);

/**
 * Get a list of all drivers.
 * @route GET /
 * @access Protected (requires authentication)
 * @middleware userAuthenticate
 * @returns {Object} 200 - List of all drivers with their details
 * @returns {Object} 404 - No drivers found
 * @returns {Object} 500 - Error message if retrieval fails
 */
router.get("/", driverController.userAuthenticate, driverController.driverList);

/**
 * Update a driver's department or license.
 * @route PUT /update
 * @access Protected (requires authentication)
 * @middleware userAuthenticate
 * @body {Object} req.body - Driver data (driverId, driverDepartment, driverLicense)
 * @returns {Object} 200 - Updated driver details
 * @returns {Object} 400 - Missing or invalid data in request body
 * @returns {Object} 404 - Driver not found
 * @returns {Object} 500 - Error message if update fails
 */
router.put("/update", driverController.userAuthenticate, driverController.driverUpdate);

/**
 * Log in to the website.
 * @route POST /login
 * @body {Object} req.body - User credentials (username, password)
 * @returns {Object} 200 - Success message for valid login
 * @returns {Object} 400 - Invalid username or password
 * @returns {Object} 500 - Error message if login fails
 */
router.post("/login", driverController.logIn);

/**
 * Sign up for the website.
 * @route POST /signup
 * @body {Object} req.body - User details (username, email, password, confirm-password)
 * @returns {Object} 200 - Success message for successful signup
 * @returns {Object} 400 - Error messages for invalid input or existing user
 * @returns {Object} 500 - Error message if signup fails
 */
router.post("/signup", driverController.signUp);

module.exports = router;
