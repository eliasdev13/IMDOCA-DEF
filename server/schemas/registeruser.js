// validation/registerUserSchema.js
const Joi = require("joi");

module.exports.registerUserSchema = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required(),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "cl"] } })
    .required(),

  password: Joi.string().min(3).max(30).required(),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Las contraseñas no coinciden" }),

  rol_id: Joi.number().valid(1, 2).required() // SOLO admin o vendedor
});
