import {object , string , TypeOf, z} from 'zod';

const cartItem = object({

    name : string({
        required_error : "The name field is required",
        invalid_type_error : "The name field must be a string"
    }).min(1,"name field cannot be empty"),
    quantity : z.string({
         required_error : "The quantity field is required",
         invalid_type_error : "The quantity must be a string"
    }).min(1,"the quantity field cannot be empty").transform((val) => Number(val))

}).strict()


const deliveryDetails = object({

     email : z.string().min(1).email(),
     name : z.string().min(1),
     addressLine1 : z.string().min(1),
     city : z.string().min(1)

}).strict()


export const checkoutSessionRequest = object({

    cartItems : z.array(cartItem,{
        required_error : "The menu items field is required"
    }).nonempty("There must be at least 1 cart item"),
    deliveryDetails : deliveryDetails,
    restaurantId : z.string().min(1)
})


export type CheckOutSessionRequestSchema = TypeOf<typeof checkoutSessionRequest>



// type CheckoutSessionRequest = {

//     cartItems : {
//         name : string,
//         quantity : string
//     }[];
//     deliveryDetails: {
//         email : string;
//         name: string;
//         addressLine1 : string;
//         city : string
//     };
//     restaurantId : string

// }