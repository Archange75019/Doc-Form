module.exports = (req, res, next) => {
    try {
      const token = req.cookies[process.env.cookie_name].token
      const decodedToken = jwt.verify(token, process.env.TOKEN);
      const userId = decodedToken.userId;
     
      if (req.body.userId && req.body.userId !== userId) {
        throw 'Invalid user ID';
      } else {
        
        next();
      }
    } catch {
      res.redirect('/')
    }
  }; 