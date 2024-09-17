const admin = require("firebase-admin");
const serviceAccount = require("./service-account.json");

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

/**
 * Initializes the database by creating a 'crudCounters' document
 * with default values if it does not already exist.
 * 
 * @async
 * @function initializeDatabase
 * @returns {Promise<void>} - Resolves when initialization is complete.
 */
async function initializeDatabase() {
    const counterRef = db.collection('crudCounters').doc('counters');
    const doc = await counterRef.get();
    if (!doc.exists) {
        await counterRef.set({
            insert: 0,
            retrieve: 0,
            update: 0,
            delete: 0
        });
        console.log("Database initialized with counter document");
    } else {
        console.log("Counter document already exists");
    }
}

/**
 * Retrieves all CRUD operation counters from the 'crudCounters' document.
 * 
 * @async
 * @function getAllCounters
 * @returns {Promise<Object>} - Returns an object containing the counters for 'insert', 'retrieve', 'update', and 'delete' operations.
 */
async function getAllCounters() {
    const counterRef = db.collection('crudCounters').doc('counters');
    const doc = await counterRef.get();
    if (doc.exists) {
        return doc.data();
    } else {
        console.log("No counter document found");
        return {
            insert: 0,
            retrieve: 0,
            update: 0,
            delete: 0
        };
    }
}

/**
 * Updates the counter for a specific CRUD operation.
 * 
 * @async
 * @function updateCounter
 * @param {string} operation - The CRUD operation to increment ('insert', 'retrieve', 'update', or 'delete').
 * @returns {Promise<void>} - Resolves when the counter update is complete.
 */
async function updateCounter(operation) {
    const counterRef = db.collection('crudCounters').doc('counters');
    await counterRef.update({
        [operation]: admin.firestore.FieldValue.increment(1)
    });
}

module.exports = {
    initializeDatabase,
    getAllCounters,
    updateCounter
};