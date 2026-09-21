const path = require("node:path");

const {createId} = require("../../../utils/id");
const {readJsonArray, writeJsonArray} = require("../../../utils/jsonStore");
const ACTIVITY_FILE_PATH = path.join(process.cwd(), "data", "activity.json");

async function getAllActivity() {
  return readJsonArray(ACTIVITY_FILE_PATH);
}

async function createNewActivity(payload) {
  const activities = await readJsonArray(ACTIVITY_FILE_PATH);
  const newActivity = {
    id: createId(),
    action: payload.action,
    info: payload.info,
    when: new Date().toISOString(),
  };

  activities.push(newActivity);
  await writeJsonArray(ACTIVITY_FILE_PATH, activities);
  return newActivity;
}

module.exports = {
  getAllActivity,
  createNewActivity,
};
