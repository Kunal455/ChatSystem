const jwt = require("jsonwebtoken")

const jwttoken = (userId, res)=>{
    const token = jwt.sign(
    { userId },                 // payload
    process.env.JWT_SECRET,     // secret key
    { expiresIn: "30d" }        // options
);

    res.cookie('jwt', token, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly:true,
        sameSite: "strict",
        secure:process.env.SECURE !== "development"
    })
    return token
}
module.exports = jwttoken