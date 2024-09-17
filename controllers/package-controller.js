const Package = require("../models/Package");
const Driver = require("../models/Driver");
const { updateCounter } = require('../firebase-crud');
const admin = require('firebase-admin');
const db_login = admin.firestore();

let userLoggedIn = false;

module.exports = {
    /**
     * Adds a new package to the database.
     * 
     * @param {Object} req - The request object containing the package data in the body.
     * @param {Object} res - The response object used to send the response.
     * @returns {Promise<void>} - A promise that resolves with the status of the package creation.
     */
    addPackage: async function (req, res) {
        try {
            let packageData = req.body;

            if (!packageData.packageTitle || !packageData.packageWeight || !packageData.packageDestination || !packageData.packageIsAllocated || !packageData.packageAssignedDriver) {
                return res.status(400).json({ message: "Missing required fields" });
            }

            const newPackage = new Package({
                packageTitle: packageData.packageTitle,
                packageWeight: parseFloat(packageData.packageWeight),
                packageDestination: packageData.packageDestination,
                packageDescription: packageData.packageDescription,
                packageIsAllocated: packageData.packageIsAllocated === 'true',
                packageAssignedDriver: packageData.packageAssignedDriver
            });

            await newPackage.save();
            await Driver.findByIdAndUpdate(newPackage.packageAssignedDriver, { $push: { assigned_packages: newPackage._id } });

            // Update the counter
            await updateCounter('insert');

            res.status(201).json({
                id: newPackage._id,
                package_id: newPackage.packageId
            });
        } catch (error) {
            res.status(500).json({ message: "Failed to add package", error: error.message });
        }
    },

    /**
     * Retrieves the list of all packages from the database.
     * 
     * @param {Object} req - The request object.
     * @param {Object} res - The response object used to send the list of packages.
     * @returns {Promise<void>} - A promise that resolves with the list of packages.
     */
    packageList: async function (req, res) {
        try {
            const packages = await Package.find({}).populate('packageAssignedDriver');

            if (packages.length === 0) {
                return res.status(404).json({ message: "No packages found" });
            }

            res.status(200).json(packages);

            // Update the counter
            await updateCounter('retrieve');

        } catch (error) {
            res.status(500).json({ message: "Failed to retrieve packages", error: error.message });
        }
    },

    /**
     * Deletes a package by its ID.
     * 
     * @param {Object} req - The request object containing the package ID in the query string.
     * @param {Object} res - The response object used to send the deletion status.
     * @returns {Promise<void>} - A promise that resolves with the deletion result.
     */
    deletePackage: async function (req, res) {
        try {
            const packageId = req.query.id;

            const package = await Package.findById(packageId);
            if (!package) {
                return res.status(404).json({ message: "Package not found" });
            }

            if (package.packageAssignedDriver) {
                await Driver.updateOne(
                    { _id: package.packageAssignedDriver },
                    { $pull: { assigned_packages: package._id } }
                );
            }

            const deleteResult = await Package.findByIdAndDelete(packageId);

            if (deleteResult) {
                res.status(200).json({
                    acknowledged: true,
                    deletedCount: 1
                });

                // Update the counter
                await updateCounter('delete');

            } else {
                res.status(404).json({ message: "Package not found" });
            }
        } catch (error) {
            console.error("Error in deletePackage:", error);
            res.status(500).json({ message: "Failed to delete package", error: error.message });
        }
    },

    /**
     * Updates the destination of a package by its ID.
     * 
     * @param {Object} req - The request object containing the package ID and new destination in the body.
     * @param {Object} res - The response object used to send the update status.
     * @returns {Promise<void>} - A promise that resolves with the updated package information.
     */
    packageUpdate: async function(req, res) {
        try {
            const { packageId, packageDestination } = req.body;
    
            if (!packageId) {
                return res.status(400).json({ status: "Package ID is required" });
            }
    
            if (!packageDestination) {
                return res.status(400).json({ status: "Package destination is required for update" });
            }
    
            const updatedPackage = await Package.findByIdAndUpdate(
                packageId,
                { packageDestination: packageDestination },
                { new: true }
            );
    
            if (!updatedPackage) {
                return res.status(404).json({ status: "Package not found" });
            }
    
            // Update the counter
            await updateCounter('update');
    
            res.status(200).json({ 
                status: "Updated successfully",
                package: updatedPackage
            });
    
        } catch (error) {
            res.status(500).json({ message: "Failed to update package", error: error.message });
        }
    }
};
