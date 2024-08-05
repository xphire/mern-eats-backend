import {object , string , TypeOf, z} from 'zod';


const menuItem = object({

    name : string({
        required_error : "The name field is required",
        invalid_type_error : "The name field must be a string"
    }).min(1,"name field cannot be empty"),
    price : z.coerce.number({
        required_error : "The price field is required",
        invalid_type_error : "The price must be a number"
    }).min(1,"price field cannot be empty").nonnegative("price cannot be less than 0").multipleOf(0.01,"price must be to 2 decimal places")

},{
    required_error : "The menuItems field is required"
}).strict()


export const createRestaurant = object({
    
    name : string({
        required_error : "The restaurant name is required",
        invalid_type_error : "The restaurant field must be a string"
    }).min(1,"name field cannot be empty"),
    city : string({
        required_error : "The city field is required",
        invalid_type_error : "The city field must be a string"
    }).min(1, "city field cannot be empty"),
    country : string({
        required_error : "The country field is required",
        invalid_type_error : "The country field must be a string"
    }).min(1, "country field cannot be empty"),
    deliveryPrice : z.coerce.number({
        required_error : "The delivery price field is required",
        invalid_type_error : "The deliveryPrice must be a number"
    }).min(1, "delivery price cannot be empty").nonnegative("delivery price cannot be less than 0").multipleOf(0.01,"delivery price must be to 2 decimal places"),
    estimatedDeliveryTime : z.coerce.number({
        required_error : "The estimated delivery time field is required",
        invalid_type_error : "The estimated delivery time must be a number"
    }).min(1, "estimated delivery time cannot be empty").int("the estimated delivery time must be an integer").nonnegative("estimated delivery time cannot be less than 0"),
    cuisines: z.array(z.string(), {
        required_error : "The cuisines field is required"
    }).nonempty("There must be at least 1 cuisine name"),
    MenuItems :  z.array(menuItem, {
        required_error : "The menu items field is required"
    }).nonempty("There must be at least 1 menu item") 
}).strict()





export type createRestaurantSchema = TypeOf<typeof createRestaurant>