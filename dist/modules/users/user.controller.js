"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.fetchUser = fetchUser;
const client_1 = require("@prisma/client");
//import * as UserService from '../users/user.service'
const UserSchema = __importStar(require("../users/user.schema"));
const Sentry = __importStar(require("@sentry/node"));
const prisma = new client_1.PrismaClient({
    errorFormat: 'pretty'
});
function createUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const body = req.body;
            UserSchema.createUser.parse(body);
            const existingUser = yield prisma.user.findFirst({
                where: {
                    email: body.email
                }
            });
            if (existingUser)
                return res.status(200).send(existingUser);
            const user = yield prisma.user.create({
                data: body
            });
            return res.status(201).send(user);
        }
        catch (error) {
            Sentry.captureException(error);
            next(error);
        }
    });
}
function updateUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            UserSchema.updateUser.parse(req.body);
            const { name, addressLine1, country, city } = req.body;
            const user = yield prisma.user.findFirst({
                where: {
                    auth0Id: req.auth0Id
                }
            });
            if (!user)
                res.status(404).send({ status: "failed", message: "user not found" });
            const updatedUser = yield prisma.user.update({
                data: {
                    name, addressLine1, country, city
                },
                where: {
                    id: req.userId
                }
            });
            res.statusCode = 200;
            return res.send(updatedUser);
        }
        catch (error) {
            Sentry.captureException(error);
            next(error);
        }
    });
}
function fetchUser(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield prisma.user.findFirst({
                where: {
                    id: req.userId
                }
            });
            if (!user)
                res.status(404).send({ status: "failed", message: "user not found" });
            res.statusCode = 200;
            res.send(user);
        }
        catch (error) {
            Sentry.captureException(error);
            next(error);
        }
    });
}
