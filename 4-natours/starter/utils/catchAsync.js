const catchAsync = (fn) => {
  return (req, res, next) => {
    // fn(req, res, next).catch((err) => next(err));
    fn(req, res, next).catch(next); // Same as above
  };
};

export default catchAsync;
