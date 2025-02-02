"use strict";
/**
 * LLM integration types for PR analysis
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMError = void 0;
/**
 * LLM error
 */
class LLMError extends Error {
    type;
    constructor(message, type) {
        super(message);
        this.type = type;
        this.name = 'LLMError';
    }
}
exports.LLMError = LLMError;
//# sourceMappingURL=types.js.map