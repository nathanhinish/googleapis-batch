const debug = require("debug")("googleapis:batch");
const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");

const TEMPLATE_CONTENT = fs.readFileSync(
  path.join(__dirname, "../templates/request.handlebars"),
  "utf8"
);
module.exports = Handlebars.compile(TEMPLATE_CONTENT);
