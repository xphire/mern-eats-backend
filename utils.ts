
import {Express} from 'express';

import { Buffer } from "buffer";

import cloudinary from 'cloudinary'
import { MenuItem, Prisma } from '@prisma/client';
import {  CheckOutSessionRequestSchema } from './src/modules/orders/orders.schema';
import Stripe from 'stripe';


type searchReformed = {

    name : string,
    cuisines : Array<string>
}

type Query = {

    searchQuery : string;
    sortOption? : string;
    selectedCuisines? : string;
    page? : number
}

type ProcessedQuery = {

    name : string,
    cuisines : Array<string>,
    selectedCuisines : Array<string>,
    city : string
     
}


export function processSearchQuery(query : string) : searchReformed{


    /*

        sample query: http://localhost:7000/api/v1/restaurants/search/Manchester?searchQuery=&page=1&selectedCuisines=American%2CBBQ%2CCafe 
    
    */
  

    //receives the string and replace all non-alphanumeric characters with " "

    const pattern = /[^a-zA-Z0-9]/g;

    //@ts-expect-error replaceAll method of string not recognized by ts

    const replaced : string = query.replaceAll(pattern," ")

    //capitalize the first letter of each word


    return {
        name : replaced,
        cuisines : replaced.toLowerCase().split(" ").map((x) => x.replace(x.charAt(0),x.charAt(0).toUpperCase()))
    }

    //return replaced.toLowerCase().split(" ").map((x) => x.replace(x.charAt(0),x.charAt(0).toUpperCase()))

} 


export function queryProcessor({searchQuery = "",selectedCuisines = ""} : Query, city : string) : ProcessedQuery{

      const result : ProcessedQuery  = {
          
          name : searchQuery,
          cuisines : [],
          selectedCuisines : [],
          city : city

      }

      result["cuisines"] = searchQuery.toLowerCase().split(" ").map((x) => x.replace(x.charAt(0),x.charAt(0).toUpperCase()))
      result["selectedCuisines"] = selectedCuisines.split(",")
  


      return result       
      
}


export function searchQueryBuilder(builder: ProcessedQuery) : Prisma.RestaurantWhereInput{



     const noSelectedCuisines = builder.selectedCuisines.length === 0 || builder.selectedCuisines[0] === ''

    //  console.log("no selected cuisines", noSelectedCuisines);

    //  console.log("processed query", builder)


    /* if no search query i.e. city only, although we can have selected cuisines */

    if(!builder.name){

         //if no selected cuisines

         if(noSelectedCuisines){

               return   {

                city : {
                  equals : builder.city,
                  mode : 'insensitive'
                
             }
            } 
         }

         return {

            city : {
              equals : builder.city,
              mode : 'insensitive'
            
         },  
         
         cuisines : {
            hasEvery : builder.selectedCuisines
         }

        }
    }


    /* Now process search query */


    if (noSelectedCuisines){

         return {
              
            city : {
                equals : builder.city,
                mode : 'insensitive'
                },
                AND : [
        
                {
                    OR : [
                        {
                            cuisines : {
                                hasSome : builder.cuisines
                            }
                        },
                        {
                            name : {
                                in : builder.cuisines,
                                mode : 'insensitive'
                            }
                        },
                        {
                            name : {
                                contains : builder.name,
                                mode : 'insensitive'
                            }
                        } 
        
                    ]
                }
                
                ]
              
         }
    }


    return {
       
        city : {
            equals : builder.city,
            mode : 'insensitive'
        },

        cuisines : {
            hasEvery : builder.selectedCuisines
         },

         AND : [


            {
                OR : [


                    {
                        name : {
                            in : builder.cuisines,
                            mode : 'insensitive'
                        }
                    },
                    {
                        name : {
                            contains : builder.name,
                            mode : 'insensitive'
                        }
                    },
                    {
                        cuisines : {
                            hasSome : builder.cuisines
                        }
                    } 


                ]
            }
  
            
            
           
          ]

    }

}

export async function uploadImage(file : Express.Multer.File) : Promise<string>{


        const image = file 
  
         const base64Image  = Buffer.from(image.buffer).toString('base64')
  
         const dataURI = `data:${image.mimetype};base64,${base64Image}`
  
         const uploadResponse = await cloudinary.v2.uploader.upload(dataURI)
  
         return uploadResponse.url
  
  
}


export function createLineItems(request : CheckOutSessionRequestSchema, menuItems : MenuItem[]){


    const lineItems = request.cartItems.map((cartItem) => {

          const menuItem = menuItems.find(item => item.name === cartItem.name)

          if(!menuItem){
             throw new Error(`Menu item not found: ${cartItem.name} `)
          }

          const line_item : Stripe.Checkout.SessionCreateParams.LineItem = {

               price_data : {
                   currency : "usd",
                   unit_amount : menuItem.price,
                   product_data : {
                     name : menuItem.name
                   }
               },
               quantity : cartItem.quantity
          };


          return line_item

    })

    return lineItems



}


export async function createStripeSession(STRIPE : Stripe,FRONTEND_URL : string,lineItems : Stripe.Checkout.SessionCreateParams.LineItem[], orderId : string, deliveryPrice : number , restaurantId : string){


    const sessionData = await STRIPE.checkout.sessions.create({
         line_items : lineItems,
         shipping_options : [
            {
                shipping_rate_data : {
                    display_name : "Delivery",
                    type : "fixed_amount",
                    fixed_amount  : {
                        amount: deliveryPrice,
                        currency : "usd"
                    }
                }
            }
         ],
         mode : "payment",
         metadata : {
            orderId,
            restaurantId
         },
         success_url : `${FRONTEND_URL}/order-status?success=true`,
         cancel_url : `${FRONTEND_URL}/restaurants/${restaurantId}?cancelled=true`
    })


    return sessionData;




}