const express = require("express");
const serverless = require("serverless-http");

const bodyParser = require("body-parser");
const jsonServer = require("json-server");

const db = require("../../dataserver/data/employees.json");
const router = jsonServer.router(db);

const app = express();
app.use(bodyParser.json());
app.use("/.netlify/functions/json-server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
