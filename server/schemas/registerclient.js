// validation/registerClientSchema.js
const Joi = require("joi");

module.exports.registerClientSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),

  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "cl"] } })
    .required(),

  password: Joi.string().min(3).max(30).required(),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({ "any.only": "Las contraseñas no coinciden" }),

  rut: Joi.string().required(),
  razon_social: Joi.string().required(),
  direccion: Joi.string().required(),
  telefono: Joi.string().required()
});
