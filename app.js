/**
 * Welcome to DataNest!
 * @author Shubh Bajpai <sbaj0015@student.monash.edu>
 */

const express = require("express");
const path = require("path");

const driverRoutes = require('./routes/driver-routes');
const packageRoutes = require('./routes/package-routes');

/**
 * Port number for the server
 * @type {number}
 */
const PORT_NUMBER = 8080;

/**
 * Base URL path for the application
 * @type {string}
 */
const stuID_PORT = "/33310440/Shubh/";

const Driver = require('./models/Driver');
const Package = require('./models/Package');

//get the firebase operations
const { initializeDatabase, getAllCounters, updateCounter } = require('./firebase-crud');
const admin = require('firebase-admin');

let app = express();
//changing from true to false in order to parse json data
app.use(express.urlencoded({ extended: false }));
app.use(express.static("node_modules/bootstrap/dist/css"));
app.use(express.static("public"));
app.set('views', path.join(__dirname, "/views/"));
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//setting up mongodb
const mongoose = require('mongoose');
const {ObjectId} = require('mongodb');

//Configuring API routes
app.use(`${stuID_PORT}api/v1/driver`, driverRoutes);
app.use(`${stuID_PORT}api/v1/package`, packageRoutes);

//saving the data within the following url of Compass
const url = "mongodb://localhost:27017/assignment2";

/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * @returns {Promise} A promise that resolves when the connection is established.
 */
async function connect() {
	await mongoose.connect(url);
}
connect();

/**
 * Initializes the database by calling the initializeDatabase() function from the firebase-crud module.
 * @returns {Promise} A promise that resolves when the database initialization is complete.
 */
async function initialize() {
    await initializeDatabase();
}
initialize();

/**
 * Route handler for the operations (operations.html)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "operations", userAuthenticate, async function (req, res) {
    const counters = await getAllCounters();

    //updating the counter
    await updateCounter('retrieve');

    res.render("operations.html", { counters });
});

const db_login = admin.firestore()

//global variable to check if the user has logged in
let userLoggedIn = false;

/**
 * Middleware function to check if a user is logged in.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function userAuthenticate(req, res, next) {
    if (userLoggedIn) {
        return next();
    } else {
        res.redirect(`${stuID_PORT}` + 'users/login');
    }
}

/**
 * Route handler for the login page (GET)
 * Renders the login page or redirects to the home page if the user is already logged in.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "users/login", function (req, res) {
    if (userLoggedIn) {
        res.redirect("/");
    } else {
        res.render("login.html");
    }
});

/**
 * Route handler for processing login (POST)
 * Validates the username and password against the Firebase database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post(`${stuID_PORT}users/login`, async function (req, res) {
    const { username, password } = req.body;
    try {
        const findUser = await db_login.collection('users')
            .where('username', '==', username)
            .limit(1) //return only one document
            .get();
        
        if (findUser.empty) {
            return res.redirect(`${stuID_PORT}` + 'invalid');
        }
        
        const user = findUser.docs[0].data();
        
        // Check if the password matches
        if (user.password !== password) {
            return res.redirect(`${stuID_PORT}` + 'invalid');
        }

        userLoggedIn = true;
        res.redirect("/");
    } catch (error) {
        console.error("Error logging in:", error);
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }
});

/**
 * Route handler for the signup page (GET)
 * Renders the signup page or redirects to the home page if the user is already logged in.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "users/signup", function (req, res) {
    if (userLoggedIn) {
        res.redirect("/");
    } else {
        res.render("signup.html");
    }
});

/**
 * Route handler for processing signup (POST)
 * Validates the signup form data and creates a new user in the Firebase database.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post('/33310440/Shubh/users/signup', async (req, res) => {
    const { username, email, password, 'confirm-password': confirmPassword } = req.body;

    if (!username || !email || !password || !confirmPassword) {
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }

    if (username.length <= 6 || !/^[a-zA-Z0-9]+$/.test(username)) {
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }

    if (password.length < 5 || password.length > 10) {
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }

    if (password !== confirmPassword) {
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }

    try {
        //checks if a user with the same email already exists
        const existingUser = await db_login.collection('users')
            .where('email', '==', email)
            .get();
        if (!existingUser.empty) {
            return res.redirect(`${stuID_PORT}` + 'invalid');
        }

        await db_login.collection('users').doc().set({
            username: username,
            email: email,
            password: password
        });

        res.redirect('/33310440/Shubh/users/login');
        // userLoggedIn = true;
    } catch (error) {
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }
});

/**
 * Route handler for the root path (index.html)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get("/", async function (req, res) {

    //display the driver count and the package count
    const driverCount = await Driver.countDocuments();
    const packageCount = await Package.countDocuments();

    res.render("index.html", {driverCount, packageCount});
});

/**
 * Route handler for the info page
 * Renders the info.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "info", userAuthenticate, async function (req, res) {

    //updating the counter
    await updateCounter('retrieve');

    res.render("info.html");
});

/**
 * Route handler for the add-driver page (GET METHOD)
 * Renders the add-driver.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "add-driver", userAuthenticate, function (req, res) {
    res.render("add-driver.html");
});

/**
 * Route handler for adding a new driver (POST METHOD)
 * Validates input and adds a new driver to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post(`${stuID_PORT}` + "add-driver", async function (req, res) {
    let {name, department, license, isActive} = req.body;
    isActive = isActive === 'true';
    console.log(req.body);

    //pushing the new json object into the database
    try{
        let driver = new Driver({driverName: name, driverDepartment: department, driverLicense: license, driverIsActive: isActive});
        await driver.save();
        //updating the counter
        await updateCounter('insert');
    } catch (error) {
        console.log(error);
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }
    res.redirect(`${stuID_PORT}` + 'driver-list');
});

/**
 * Route handler for the add-package page (GET METHOD)
 * Renders the add-package.html file with active drivers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "add-package", userAuthenticate, async function (req, res) {

    const activeDrivers = await Driver.find({driverIsActive: true});
    res.render("add-package.html", {drivers: activeDrivers});
});

/**
 * Route handler for adding a new package (POST METHOD)
 * Validates input and adds a new package to the database
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.post(`${stuID_PORT}` + "add-package", async function (req, res) {
    let {title, weight, destination, description, isAllocated, driverId} = req.body;
    isAllocated = isAllocated === 'true';
    weight = parseInt(weight);
    console.log(req.body);

    //pushing the new json object into the database
    try{
        let assignedDriver = await Driver.findById(driverId);

        if (!assignedDriver) { 
            throw new Error("Driver not found");
        }

        let package = new Package({
            packageTitle: title,
            packageWeight: weight,
            packageDestination: destination,
            packageDescription: description,
            packageIsAllocated: isAllocated,
            packageAssignedDriver: assignedDriver
        });
        await package.save();

        //updating the counter
        await updateCounter('insert');

        //push the package to the driver if the package has been allocated
        if (isAllocated) {
            let updateDriver = await Driver.findById(driverId);
            if (!updateDriver) {
                throw new Error("Driver not found");
            }
            console.log(updateDriver);

            // Push the package into the driver's assigned packages array
            updateDriver.assigned_packages.push(package);
            await updateDriver.save();
        }

    } catch (error) {
        console.log(error);
        return res.redirect(`${stuID_PORT}` + 'invalid');
    }

    res.redirect(`${stuID_PORT}` + 'package-list');
});

/**
 * Deletes a driver from the database
 * @param {string} id - The ID of the driver to delete
 * @returns {boolean} True if the driver was deleted, false otherwise
 */
async function deleteDriver(id) {
    try {
        const driver = await Driver.findOne({driverId: id});
        if (!driver) {
            return false;
        }
        await Driver.deleteOne({driverId: id});
        return true;
    } catch (error) {
        console.error("Error in deleteDriver:", error);
        return false;
    }
}

/**
 * Route handler for deleting a driver
 * Deletes a driver if an ID is provided, otherwise renders the delete-driver.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "delete-driver", userAuthenticate, async function (req, res) {
    const driverId = req.query.id;
    
    if (driverId) {
        const deleted = await deleteDriver(driverId);
        if (deleted) {
            res.redirect(`${stuID_PORT}` + 'driver-list');

            //updating the counter
            await updateCounter('delete');

        } else {
            res.redirect(`${stuID_PORT}` + 'invalid');
        }
    } else {
        res.render("delete-driver.html");
    }
});

/**
 * Deletes a package from the database
 * @param {string} id - The ID of the package to delete
 * @returns {boolean} True if the package was deleted, false otherwise
 */
async function deletePackage(id) {
    try {
        const packageToDelete = await Package.findOne({ packageId: id });
        if (!packageToDelete) {
            return false;
        }
        const result = await Package.deleteOne({ packageId: id });
        return result.deletedCount === 1;
    } catch (error) {
        console.error("Error in deletePackage:", error);
        return false;
    }
}

/**
 * Route handler for deleting a package
 * Deletes a package if an ID is provided, otherwise renders the delete-package.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "delete-package", userAuthenticate, async function (req, res) {
    const packageId = req.query.id;
    
    if (packageId) {
        const deleted = await deletePackage(packageId);
        if (deleted) {
            res.redirect(`${stuID_PORT}` + 'package-list');

            //updating the counter
            await updateCounter('delete');

        } else {
            res.redirect(`${stuID_PORT}` + 'invalid');
        }
    } else {
        res.render("delete-package.html");
    }
});

/**
 * Route handler for listing drivers by department
 * Renders the driver-dep-list.html file with drivers filtered by department
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "driver-dep-list", userAuthenticate, async function (req, res) {
    const selectedDepartment = req.query.department;

    const driversByDepartment = {
        Food: await Driver.find({driverDepartment: "Food"}).populate("assigned_packages"),
        Furniture: await Driver.find({driverDepartment: "Furniture"}).populate("assigned_packages"),
        Electronic: await Driver.find({driverDepartment: "Electronic"}).populate("assigned_packages")
    }

    //updating the counter
    await updateCounter('retrieve');

    res.render("driver-dep-list.html", {driversByDepartment, selectedDepartment});
});

/**
 * Route handler for listing all drivers
 * Renders the driver-list.html file with all drivers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "driver-list", userAuthenticate, async function (req, res) {

    //populating the assigned packages for each driver
    let drivers = await Driver.find({}).populate("assigned_packages");

    //updating the counter
    await updateCounter('retrieve');

    res.render("driver-list.html", {drivers});
});

/**
 * Route handler for listing all packages
 * Renders the package-list.html file with all packages
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "package-list", userAuthenticate, async function (req, res) {
    //getting a list of all the packages
    const packages = await Package.find().populate("packageAssignedDriver");

    //updating the counter
    await updateCounter('retrieve');

    res.render("package-list.html", {packages});
});

/**
 * Route handler for invalid inputs
 * Renders the invalid.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get(`${stuID_PORT}` + "invalid", function (req, res) {
    res.render("invalid.html");
});

/**
 * Route handler for 404 errors (invalid routes or routes that don't exist)
 * Renders the 404.html file
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
app.get("*", function (req, res) {
    res.render("404.html");
});

/**
 * Starts the Express server
 * Listens on the specified port number and logs a message to the console
 */
app.listen(PORT_NUMBER, function () {
    console.log(`listening on port ${PORT_NUMBER}`);
});