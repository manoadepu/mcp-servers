"use strict";
/**
 * Custom error types for Project Assistant
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = exports.FileSystemError = exports.AnalysisError = void 0;
class AnalysisError extends Error {
    code;
    details;
    constructor(message, code = 'ANALYSIS_ERROR', details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'AnalysisError';
    }
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
exports.AnalysisError = AnalysisError;
class FileSystemError extends Error {
    code;
    details;
    constructor(message, code = 'FILE_SYSTEM_ERROR', details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'FileSystemError';
    }
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
exports.FileSystemError = FileSystemError;
class ValidationError extends Error {
    code;
    details;
    constructor(message, code = 'VALIDATION_ERROR', details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'ValidationError';
    }
    toResponse() {
        return {
            code: this.code,
            message: this.message,
            details: this.details,
        };
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=errors.js.map