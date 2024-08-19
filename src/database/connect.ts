import process from "process";
import { PrismaClient } from "@prisma/client";


async function dbConnect(){


    try {

        const prisma = new PrismaClient()

        await prisma.$connect()

        console.log("Successfully Connected to DB");
        
    } catch (error) {

        console.error(error)
        process.exit(1)
    }
}


export default dbConnect;