// src/utils/responseHandler.js
export const ResponseStatus = {
    SUCCESS: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
};

export const sendResponse = (res, status, message, data = null, error = null) => {
    const response = {
        success: status < 400,
        message,
        ...(data && { data }),
        ...(error && { error })
    };
    return res.status(status).json(response);
};
