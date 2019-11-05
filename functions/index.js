"use strict";

const express = require("express");
const cors = require("cors");
const uuidv5 = require("uuid/v5");
const uuid = require("uuid/v4"); // use to generate random namespace
// Firebase init
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const MY_NAMESPACE = uuid();
// Express and CORS middleware init
const app = express();
app.use(cors());

// POST / method
app.post("/", (request, response) => {
  const entry = request.body;
  return admin
    .database()
    .ref("/entries")
    .push(entry)
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

    console.log("entryID", entriesId);

    const original = snapshot.val();
    console.log(original);
    const id = uuidv5(entriesId, MY_NAMESPACE);
    console.log(id, "id");
    return snapshot.ref.update({ uuid: id });
  });

exports.entries = functions.https.onRequest(app);
