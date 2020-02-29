exports.authorize = (err, req, res, next) => {
  if (err) {
    return res.status(401).json({ message: "Usuário não autorizado" });
  }
  next();
};

exports.authorizeByRole = (roles = []) => {
  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role))
      return res.status(401).json({ message: "Usuário não autorizado" });

    next();
  };
};
