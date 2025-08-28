import { body } from "express-validator"

const registerPostRequestValidator = () => {
    return [

    ]
}

const loginPostRequestValidator = () => {
    return [

    ]
}

const createPostValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isString()
            .withMessage("Title must be a string")
            .isLength({min: 5, max: 80})
            .withMessage("Title should be 5-80 characters"),

        body("description")
            .optional()
            .trim()
            .isLength({min: 10})
            .withMessage("Description should be at least 10 characters")
            .isString()
            .withMessage("Description must be a string"),

        body("postedAt")
            .optional()
            .isISO8601()
            .withMessage("PostedAt must be a valid date")
            .toDate()
    ]
}

const updatePostValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required")
            .isString()
            .withMessage("Title must be a string")
            .isLength({min: 5, max: 80})
            .withMessage("Title should be 5-80 characters"),

        body("description")
            .optional()
            .trim()
            .isLength({min: 10})
            .withMessage("Description should be at least 10 characters")
            .isString()
            .withMessage("Description must be a string"),

        body("postedAt")
            .optional()
            .isISO8601()
            .withMessage("PostedAt must be a valid date")
            .toDate()
    ]
}


export {
    registerPostRequestValidator,
    loginPostRequestValidator,
    createPostValidator,
    updatePostValidator,
}