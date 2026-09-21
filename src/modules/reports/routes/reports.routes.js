const express = require("express");

const asyncHandler = require("../../../middleware/asyncHandler");
const reportController = require("../controllers/reports.controller");

const reportsRouter = express.Router();

reportsRouter.get(
  "/tasks-summary",
  asyncHandler(reportController.getTasksSummary),
);

module.exports = reportsRouter;
