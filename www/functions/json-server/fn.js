"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const path = require("path");

const bodyParser = require("body-parser");
var jsonServer = require("json-server");

const db = require("./data/employees.json");

app.use("/api", jsonServer.router(db));

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
// router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
// router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/json-server", router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);
