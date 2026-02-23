"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceException = void 0;
exports.formatResponse = formatResponse;
exports.sanitizeUser = sanitizeUser;
class ServiceException extends Error {
    constructor(code, message, statusCode = 400) {
        super(message);
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
        this.name = 'ServiceException';
    }
}
exports.ServiceException = ServiceException;
function formatResponse(data, meta) {
    const response = { success: true, data };
    if (meta) {
        response.meta = meta;
    }
    return response;
}
function sanitizeUser(user) {
    const { password, ...rest } = user;
    return rest;
}
//# sourceMappingURL=base.types.js.map