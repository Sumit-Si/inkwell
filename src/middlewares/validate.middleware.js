import { validationResult } from "express-validator";

const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log(errors);

  if (errors.isEmpty()) {
    return next();
  }

  const extractedError = [];
  errors.array().map((err) =>
    extractedError.push({
      [err.path]: err.msg,
    }),
  )

  res.status(422).json({
    success: false,
    message: "Recieved data is not valid",
    extractedError
  })
};

export { validate };
