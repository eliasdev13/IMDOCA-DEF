const validation = (schema) => {
    const joiValidation = (req, res, next) =>{
        const { error } = schema.validate(req.body, {abortEarly: false});
        console.log(error);
        if(error){
            const { details } = error;
            res.status(422).json({ error: details });
        } else{
            next();
        }
    };
    return joiValidation;
};

module.exports = validation;