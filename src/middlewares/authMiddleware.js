// Middleware kiểm tra user đã login
export const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.error = 'Vui lòng đăng nhập để tiếp tục';
  res.redirect('/auth/login');
};

// Middleware kiểm tra user chưa login (cho trang login/register)
export const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

// Middleware kiểm tra role admin
export const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('pages/error', {
    title: '403 - Forbidden',
    message: 'Bạn không có quyền truy cập trang này',
    layout: 'layouts/main'
  });
};