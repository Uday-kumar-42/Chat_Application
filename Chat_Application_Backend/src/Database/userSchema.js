const mongoose = require("mongoose");
const Joi = require("joi");

const UserSchema = new mongoose.Schema({
  username: {
    type: String, 
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
});

function validateUser(user) {
  const schema = Joi.object({
    username: Joi.string().min(3).max(20).required().alphanum(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(user);
}

module.exports = { User: mongoose.model("User", UserSchema), validateUser };
