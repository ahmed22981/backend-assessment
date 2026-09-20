# Code Review

## Bugs

**Issue: Unhandled Missing Directory Crash**
**What is wrong:** In jsonStore.js, the readJsonArray function gracefully catches an ENOENT error if the file is missing and tries to create it using fs.writeFile. However, if the parent "data" directory itself does not exist, fs.writeFile will throw a second, unhandled ENOENT error, crashing the app.
**Why it is a problem:** If another developer clones the repository and the "data" folder is ignored by git, the application will crash on the very first API call instead of initializing cleanly.
**How to improve it:** Ensure the directory exists before writing the fallback file by using fs.mkdir(path.dirname(filePath), { recursive: true }).

**Issue: Data Model and Business Logic Mismatch**
**What is wrong:** The current Tasks data model uses a boolean "completed" field. However, the new Reports API explicitly requires tasks to be grouped by a "status" field (todo, in-progress, done).
**Why it is a problem:** The Reports API cannot be implemented accurately because the underlying data structure does not support the required states. The system currently only knows if a task is true or false, not its exact progression status.
**How to improve it:** Refactor the Tasks data model to use a "status" string field instead of the "completed" boolean. Update the validation logic in taskValidator.js and the mock data in tasks.json to reflect this change.

**Issue: Missing System Integration**
**What is wrong:** Creating, updating, or deleting a task in the Tasks module does not trigger any activity log creation.
**Why it is a problem:** The Activity module remains completely isolated, making the Activity Log useless. Consequently, the requested Reports API will not be able to return an accurate "recentActivityCount" if task mutations are not tracked.
**How to improve it:** Import the activity service into the tasks service and log an event (e.g., TASK_CREATED, TASK_UPDATED) whenever a task is successfully mutated.

## Performance

**Issue: Blocking I/O in Activity Module**
**What is wrong:** The activity.service.js uses synchronous file system methods like fs.readFileSync and fs.writeFileSync.
**Why it is a problem:** Node.js is single-threaded. Synchronous operations block the Event Loop entirely, causing the server to freeze and reject other concurrent requests while the file is being read or written.
**How to improve it:** Replace these synchronous methods with the asynchronous methods (readJsonArray and writeJsonArray) provided in the existing jsonStore.js utility.

**Issue: Race Conditions in JSON Store**
**What is wrong:** The jsonStore.js handles asynchronous writes but lacks a Mutex lock or a write queue mechanism.
**Why it is a problem:** Under concurrent load, multiple requests might read the same JSON array state simultaneously and overwrite each other's changes, leading to silent data loss.
**How to improve it:** For this assessment, keeping it simple is acceptable. However, for a production environment, this must be improved by migrating to a real database (like PostgreSQL or MongoDB) or implementing an in-memory Mutex lock for local file writes.

**Issue: Missing Pagination on List Endpoints**
**What is wrong:** The GET /tasks and GET /activity routes fetch and return the entire array of records from the JSON files in a single response.
**Why it is a problem:** As the application is used over time, returning thousands of records simultaneously will drastically consume server memory and degrade network performance.
**How to improve it:** Implement basic query parameter pagination (e.g., ?page=1&limit=10) in the list controllers and services to only process and return manageable chunks of data.

## Maintainability

**Issue: DRY Principle Violations in Tasks Module**
**What is wrong:** Data validation logic is duplicated across tasks.controller.js and tasks.service.js using long inline conditional statements. Meanwhile, a dedicated taskValidator.js file exists but is never imported or used.
**Why it is a problem:** If validation rules change in the future, developers must update the code in multiple places. It also clutters the controller and service layers with responsibilities they should not have.
**How to improve it:** Remove all inline validations from the controller and service. Import and execute the functions from taskValidator.js at the beginning of the controller methods.

**Issue: Duplicated Code in Activity Service**
**What is wrong:** The functions loadDataA and loadDataB in activity.service.js are exact duplicates of each other.
**Why it is a problem:** It creates unnecessary bloat, makes the code harder to read, and shows a lack of code reusability.
**How to improve it:** Delete the duplicated functions entirely and use the standard jsonStore.js utility for all file operations across the project.

## Security

**Issue: Missing Error Handling in Activity Routes**
**What is wrong:** The routes defined in activity.routes.js are not wrapped in the asyncHandler middleware, unlike the routes in the Tasks module.
**Why it is a problem:** Any unhandled promise rejection or runtime error in the activity controller or service will crash the entire Node.js process, potentially leading to a Denial of Service (DoS).
**How to improve it:** Wrap the controller functions in the existing asyncHandler middleware inside the activity.routes.js file.

**Issue: Missing Basic Security Middlewares**
**What is wrong:** The Express application in app.js lacks essential security configurations. There is no payload limit set on express.json(), and it lacks CORS and security header configurations (e.g., Helmet).
**Why it is a problem:** Without a strict payload limit, a malicious user can send a massive JSON payload, causing memory exhaustion and a Denial of Service (DoS) attack.
**How to improve it:** Configure express.json({ limit: '100kb' }) in app.js. Additionally, install and integrate "cors" and "helmet" to secure HTTP headers and cross-origin requests.

## Code quality

**Issue: Poor Naming Conventions**
**What is wrong:** In activity.controller.js, variables and imports are named using single letters or unclear abbreviations (e.g., x, c, aSvc, made). Furthermore, function names mix snake_case (get_activity) and camelCase (addActivity).
**Why it is a problem:** It makes the codebase unreadable, confusing, and difficult for other developers to understand or collaborate on.
**How to improve it:** Rename variables to descriptive names (e.g., rename aSvc to activityService, x to activities). Strictly enforce camelCase naming conventions for all functions and variables across the module.
