/**
 * @module PackageRoutes
 * @description Defines the routes for package-related operations
 */

const express = require('express');
const packageController = require('../controllers/package-controller');
const driverController = require('../controllers/driver-controller');

const router = express.Router();

/**
 * Route to add a new package
 * @name POST /add
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware (userAuthenticate)
 * @param {function} handler - Express route handler (addPackage)
 */
router.post("/add", driverController.userAuthenticate, packageController.addPackage);

/**
 * Route to get all packages
 * @name GET /
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware (userAuthenticate)
 * @param {function} handler - Express route handler (packageList)
 */
router.get("/", driverController.userAuthenticate, packageController.packageList);

/**
 * Route to delete a package by ID
 * @name DELETE /delete
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware (userAuthenticate)
 * @param {function} handler - Express route handler (deletePackage)
 */
router.delete("/delete", driverController.userAuthenticate, packageController.deletePackage);

/**
 * Route to update package destination by ID
 * @name PUT /update
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} middleware - Express middleware (userAuthenticate)
 * @param {function} handler - Express route handler (packageUpdate)
 */
router.put("/update", driverController.userAuthenticate, packageController.packageUpdate);

/**
 * Route for user login
 * @name POST /login
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} handler - Express route handler (logIn)
 */
router.post("/login", driverController.logIn);

/**
 * Route for user signup
 * @name POST /signup
 * @function
 * @memberof module:PackageRoutes
 * @inner
 * @param {string} path - Express path
 * @param {function} handler - Express route handler (signUp)
 */
router.post("/signup", driverController.signUp);

module.exports = router;