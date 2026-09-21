const HttpError = require("../../../utils/httpError");

const ALLOWED_FIELDS = ["title", "status"];
const VALID_STATUS = ["todo", "in-progress", "done"];

function validatePayloadShape(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new HttpError(400, "Body must be a JSON object.");
  }
}

function ensureNoUnknownFields(payload) {
  const unknownFields = Object.keys(payload).filter(
    (field) => !ALLOWED_FIELDS.includes(field),
  );

  if (unknownFields.length > 0) {
    throw new HttpError(400, "Body contains unsupported fields.", {
      unsupportedFields: unknownFields,
    });
  }
}

function normalizeTitleIfPresent(payload, normalized) {
  if (!Object.hasOwn(payload, "title")) {
    return;
  }

  if (typeof payload.title !== "string") {
    throw new HttpError(400, '"title" must be a string.');
  }

  const trimmedTitle = payload.title.trim();
  if (!trimmedTitle) {
    throw new HttpError(400, '"title" cannot be empty.');
  }

  normalized.title = trimmedTitle;
}

function normalizeCompletedIfPresent(payload, normalized) {
  if (!Object.hasOwn(payload, "status")) {
    return;
  }

  if (!VALID_STATUS.includes(payload.status)) {
    throw new HttpError(
      400,
      `"Status" must be one of ${VALID_STATUS.join(", ")}.`,
    );
  }

  normalized.status = payload.status;
}

function validateCreateTask(payload) {
  validatePayloadShape(payload);
  ensureNoUnknownFields(payload);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (!Object.hasOwn(normalized, "title")) {
    throw new HttpError(400, '"title" is required.');
  }

  if (!Object.hasOwn(normalized, "status")) {
    normalized.status = "todo";
  }

  return normalized;
}

function validateUpdateTask(payload) {
  validatePayloadShape(payload);
  ensureNoUnknownFields(payload);

  const normalized = {};
  normalizeTitleIfPresent(payload, normalized);
  normalizeCompletedIfPresent(payload, normalized);

  if (Object.keys(normalized).length === 0) {
    throw new HttpError(400, "Provide at least one updatable field.");
  }

  return normalized;
}

module.exports = {
  validateCreateTask,
  validateUpdateTask,
};
