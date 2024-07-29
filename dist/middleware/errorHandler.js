"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const library_1 = require("@prisma/client/runtime/library");
const zod_1 = require("zod");
function default_1(error, _req, res, _next) {
    console.log({
        error: error,
        time: new Date().toLocaleString()
    });
    const statusCode = error.status || error.statusCode;
    if (statusCode === 401) {
        res.statusCode = 401;
        return res.send(renderFailure(["unauthorized"]));
    }
    if (error instanceof zod_1.ZodError) {
        const msgs = error.issues.map((x) => x.message);
        res.statusCode = 400;
        return res.send(renderFailure(msgs));
    }
    if (error instanceof library_1.PrismaClientKnownRequestError && error.code === "P2002") {
        res.statusCode = 400;
        return res.send(renderFailure(["user already exists"]));
    }
    res.statusCode = 500;
    return res.send(renderFailure(["something went wrong"]));
}
function renderFailure(errors) {
    return {
        status: "failed",
        errors: errors.map((x) => { return { error: x }; })
    };
}
