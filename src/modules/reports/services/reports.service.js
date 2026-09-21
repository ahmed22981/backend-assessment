const taskService = require("../../tasks/services/tasks.service");
const activityService = require("../../activity/services/activity.service");

async function getTasksSummary() {
  const tasks = await taskService.getAllTasks();
  const activities = await activityService.getAllActivity();

  const summary = {
    total: tasks.length,
    byStatus: {
      todo: 0,
      "in-progress": 0,
      done: 0,
    },
    recentActivityCount: activities.length,
  };

  for (const task of tasks) {
    if (summary.byStatus[task.status] !== undefined) {
      summary.byStatus[task.status]++;
    }
  }
  return summary;
}

module.exports = {
  getTasksSummary,
};
