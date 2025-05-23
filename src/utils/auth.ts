import jwt from "jsonwebtoken";
import mongoose from "mongoose";
var User = mongoose.model("User");

function getTokenFromHeader(req: any) {
  if (
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Token") ||
    (req.headers.authorization &&
      req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

const userAuth = (req: any, res: any, next: any) => {
  try {
    let token = getTokenFromHeader(req);
    if (!token) return next({ status: 401, message: " No Token Found " });
    jwt.verify(token, process.env.JWT_SECRET as string, async function (err: any, decode: any) {
        
        if (err) return next({ status: 401, message: " Invalid Token " });
        let user = await User.findById(decode.data.id);
        if (!user) return next({ status: 401, message: " Unauthorised Access " });
        req.payload = token;
        req.user = user;
        next();
    });
  } catch (err) {
    console.log(err);
    next({ status: 401, message: err });
  }
};

export { userAuth };