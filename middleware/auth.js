module.exports = {
  isUserLogged: (req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/login");
    }
  },
  userInfo: (req, res, next) => {
    if (req.user) {
      res.locals.user = req.user;
      next();
    } else {
      req.user = null;
      res.locals.user = null;
      next();
    }
  },
};
