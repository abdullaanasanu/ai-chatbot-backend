import jwt from "jsonwebtoken";
import mongoose from "mongoose";

var UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "can't be blank"] },
    email: {
      type: String,
      lowercase: true,
      unique: true,
    },
    passwordHash: { type: String },

  },
  { timestamps: true }
);

UserSchema.methods.generateJWT = function () {

  let token = jwt.sign(
    {
      data: {
        id: this._id,
      },
    },
    process.env.JWT_SECRET as string,
  );
  return token;
};

mongoose.model("User", UserSchema);
