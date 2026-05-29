const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Truy cập bị từ chối. Không tìm thấy mã xác thực Token!'
        });
    }

    try {
        const decoded = jwt.verify(token, 'HospitalT&Ntoken');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Mã xác thực Token không hợp lệ hoặc đã hết hạn!'
        });
    }
};

module.exports = verifyToken;