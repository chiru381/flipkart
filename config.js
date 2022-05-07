const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  accessKeyId: process.env.accessKeyId || "accessKeyId",
  secretAccessKey: process.env.secretAccessKey || "secretAccessKey",
};
