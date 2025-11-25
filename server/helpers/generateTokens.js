const jwt = require("jsonwebtoken");

// Genera Access Token
module.exports.generateAccessToken = (user) => {
  return jwt.sign(
    {
      uid: user.user_id,
      roleId: user.rol_id
    },
    process.env.JWT_ACCESS,
    { expiresIn: process.env.EXPIRE_ACCESS }
  );
};

// Genera Refresh Token y lo guarda en cookie HttpOnly
module.exports.generateRefreshToken = (uid, res) => {
  const refreshToken = jwt.sign(
    { uid },
    process.env.JWT_REFRESH,
    { expiresIn: process.env.EXPIRE_REFRESH } 
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.MODO !== "developer", 
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
