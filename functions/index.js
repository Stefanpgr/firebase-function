"use strict";

const express = require("express");
const cors = require("cors");
const uuidv5 = require("uuid/v5");
// Firebase init
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const MY_NAMESPACE = "ce056469-0b51-43c9-953f-ca3576a29455";
// Express and CORS middleware init
const app = express();
app.use(cors());

// POST / method
app.post("/", (request, response) => {
  request.body.id = new Date();

  return admin
    .database()
    .ref("/entries")
    .push(request.body)
    .then(() => {
      return response.status(200).send(entry);
    })
    .catch(error => {
      console.error(error);
      return response.status(500).send("Oh no! Error: " + error);
    });
});

// GET / method
app.get("/", (request, response) => {
  return admin
    .database()
    .ref("/entries")
    .on(
      "value",
      snapshot => {
        return response.status(200).send(snapshot.val());
      },
      error => {
        console.error(error);
        return response.status(500).send("Oh no! Error: " + error);
      }
    );
});

exports.addUid = functions.database
  .ref("/entries/{entriesId}")
  .onCreate((snapshot, context) => {
    const entriesId = context.params.entriesId;
    // Grab the current value of what was written to the Realtime Database.

    console.log("Uppercasing", entriesId);

    const original = snapshot.val();
    console.log(original);
    const id = createUid();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    return snapshot.ref.update({ uuid: id });
  });

function createUid() {
  return uuidv5("randStr", MY_NAMESPACE);
}
exports.entries = functions.https.onRequest(app);
