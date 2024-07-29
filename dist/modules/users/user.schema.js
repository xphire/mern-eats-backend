"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.createUser = void 0;
const zod_1 = require("zod");
exports.createUser = (0, zod_1.object)({
    auth0Id: (0, zod_1.string)({
        required_error: "The auth0Id field is required",
        invalid_type_error: "The auth0Id field must be a string"
    }),
    email: (0, zod_1.string)({
        required_error: "The email field is required"
    }).email("Must be a valid email address"),
    name: (0, zod_1.string)({
        invalid_type_error: "The name field must be a string"
    }).optional(),
    city: (0, zod_1.string)({
        invalid_type_error: "The city field must be a string"
    }).optional(),
    country: (0, zod_1.string)({
        invalid_type_error: "The country field must be a string"
    }).optional(),
    addressLine1: (0, zod_1.string)({
        invalid_type_error: "The addressLine1 field must be a string"
    }).optional(),
}).strict();
//strict ensures no additional properties
exports.updateUser = (0, zod_1.object)({
    name: (0, zod_1.string)({
        invalid_type_error: "The name field must be a string",
        required_error: "The name field is required",
    }).optional(),
    city: (0, zod_1.string)({
        invalid_type_error: "The city field must be a string",
        required_error: "The city field is required",
    }).optional(),
    country: (0, zod_1.string)({
        invalid_type_error: "The country field must be a string",
        required_error: "The country field is required",
    }).optional(),
    addressLine1: (0, zod_1.string)({
        invalid_type_error: "The addressLine1 field must be a string",
        required_error: "The addressLine1 field is required",
    }).optional(),
}).strict();
