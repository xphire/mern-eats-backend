//this populates the DB

import { PrismaClient } from "@prisma/client";

import {readFile} from 'fs/promises'

const prisma = new PrismaClient();

const reader =  readFile('./restaurants_data.json','utf8')


// readFile('./restaurants_data.json','utf8')
// .then(data => console.log(data))
// .catch(err => console.log(err));


Promise.resolve(reader)
.then(
    (data) => {

        //console.log(JSON.parse(data).length)

        const bulk : [] = JSON.parse(data)

        bulk.forEach(element => {

            prisma.restaurant.create({
                data : element,
                
            })
        })

        // prisma.restaurant.createMany({
        //     data : [...JSON.parse(data)]
        // })


    }
)
.catch(
    wahala => console.log(wahala)
)
.finally(
    () => console.log("done")
)
