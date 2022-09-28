const Joi = require('@hapi/joi');

//Register validation
const registerValidation = (data) => {
    const schema = Joi.object({
        username: Joi.string()
            .min(4),
        type: Joi.string()
            .min(4),
        bio: Joi.string()
            .min(10),
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required(),
        password2: Joi.any().equal(Joi.ref('password')) // confirm password
            .required()
            .options({ messages: { 'any.only': '{{#label}} does not match'} })
    });
    return schema.validate(data);
}

//Group validation
const groupValidation = (data) => {
    const schema = Joi.object({
        groupName: Joi.string()
            .min(6)
            .required()
    });
    return schema.validate(data);
}


//Login validation
const loginValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .min(6)
            .required()
            .email(),
        password: Joi.string()
            .min(6)
            .required()
    });
    return schema.validate(data);
}

//Delete validation
const deleteValidation = (data) => {
    const schema = Joi.object({
        email: Joi.string()
            .min(6)
            .required()
            .email()
    });
    return schema.validate(data);
}


module.exports.registerValidation = registerValidation;
module.exports.groupValidation = groupValidation;
module.exports.loginValidation = loginValidation;
module.exports.deleteValidation = deleteValidation;