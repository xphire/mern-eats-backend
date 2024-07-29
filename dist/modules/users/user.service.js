"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = createUser;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient({
    errorFormat: 'pretty'
});
function createUser(user) {
    return prisma.user.create({
        data: Object.assign({}, user)
    });
}
