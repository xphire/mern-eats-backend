
import {Express} from 'express';

import { Buffer } from "buffer";

import cloudinary from 'cloudinary'

export function processSearchQuery(query : string) : string[]{
  

    //receives the string and replace all non-alphanumeric characters with " "

    const pattern = /[^a-zA-Z0-9]/g;

    //@ts-expect-error replaceAll method of string not recognized by ts

    const replaced : string = query.replaceAll(pattern," ")

    //capitalize the first letter of each word

    return replaced.toLowerCase().split(" ").map((x) => x.replace(x.charAt(0),x.charAt(0).toUpperCase()))

} 


export async function uploadImage(file : Express.Multer.File) : Promise<string>{


        const image = file 
  
         const base64Image  = Buffer.from(image.buffer).toString('base64')
  
         const dataURI = `data:${image.mimetype};base64,${base64Image}`
  
         const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)
  
         return uploadResponse.url
  
  
}