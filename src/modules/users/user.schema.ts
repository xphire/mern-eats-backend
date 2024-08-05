import {object , string , TypeOf} from 'zod';

export const createUser = object({

        auth0Id : string({
             required_error : "The auth0Id field is required",
             invalid_type_error : "The auth0Id field must be a string"
        }),
        email : string({
             required_error : "The email field is required"
        }).email("Must be a valid email address"),
        name : string({
            invalid_type_error : "The name field must be a string"
        }).optional(),
        city : string({
            invalid_type_error : "The city field must be a string"
        }).optional(),
        country : string({
            invalid_type_error : "The country field must be a string"
        }).optional(),
        addressLine1 : string({
            invalid_type_error : "The addressLine1 field must be a string"
        }).optional(),

    }).strict()

    //strict ensures no additional properties

export const updateUser =  object({
    name : string({
        invalid_type_error : "The name field must be a string",
        required_error : "The name field is required",
    }).optional(),
    city : string({
        invalid_type_error : "The city field must be a string",
        required_error : "The city field is required",
    }).optional(),
    country : string({
        invalid_type_error : "The country field must be a string",
        required_error : "The country field is required",
    }).optional(),
    addressLine1 : string({
        invalid_type_error : "The addressLine1 field must be a string",
        required_error : "The addressLine1 field is required",
    }).optional(),

}).strict()

export type createUserSchema = TypeOf<typeof createUser>

export type updateUserSchema = Required<Pick<createUserSchema,"name" | "city"| "country" | "addressLine1">>