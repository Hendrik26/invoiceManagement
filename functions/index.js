// These triggers are necessary to support the "invoice" web app

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// global Constants
const userProfileCollection = 'userprofiles';
const customerCollection = 'customers'; // Spelling-errors removed here
const historyCollection = 'history'; // Spelling-errors removed here

// Writes a profile record when a new user is created
exports.createProfile = functions.auth.user()
    .onCreate((userRecord, context) => {
        const date = new Date();
        return admin.firestore().collection(userProfileCollection).doc(userRecord.uid).set({
            email: userRecord.email,
            authorityLevel: 0,
            created: date
        });
    });

// Removes the associated profile record when a user is deleted
exports.deleteProfile = functions.auth.user()
    .onDelete((userRecord, context) => {
        return admin.firestore().collection(userProfileCollection).doc(userRecord.uid).delete();
    });

// Writes a history record when a new customer document is created
exports.writeHistoryCreate = functions.firestore.document('/' + customerCollection + '/{documentId}')
    .onCreate((snap, context) => {
            const date = new Date();
            const key = 'Key-' + date.getFullYear() + '-'
                + ('0' + (date.getMonth() + 1).toString()).slice(-2) + '-'
                + ('0' + date.getDate().toString()).slice(-2) + '-'
                + ('0' + date.getHours().toString()).slice(-2) + '-'
                + ('0' + date.getMinutes().toString()).slice(-2) + '-'
                + ('0' + date.getSeconds().toString()).slice(-2) + '-'
                + ('00' + date.getMilliseconds().toString()).slice(-3);
            const customer = snap.data();
            console.log(customer);
            const ref = snap.ref;
            return ref.collection(historyCollection).doc(key).set(customer);
        }
    );

// Writes a history record when a customer document is updated
exports.writeHistoryUpdate = functions.firestore.document('/' + customerCollection + '/{documentId}')
    .onUpdate((snap, context) => {
            const date = new Date();
            const key = 'Key-' + date.getFullYear() + '-'
                + ('0' + (date.getMonth() + 1).toString()).slice(-2) + '-'
                + ('0' + date.getDate().toString()).slice(-2) + '-'
                + ('0' + date.getHours().toString()).slice(-2) + '-'
                + ('0' + date.getMinutes().toString()).slice(-2) + '-'
                + ('0' + date.getSeconds().toString()).slice(-2) + '-'
                + ('00' + date.getMilliseconds().toString()).slice(-3);
            const customer = snap.after.data();
            console.log(customer);
            const ref = snap.after.ref;
            return ref.collection(historyCollection).doc(key).set(customer);
        }
    );

