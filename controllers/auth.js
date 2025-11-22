const User = require('../models/User')
const handleValidationError = require('../utils/handlerValidate')
const logError = require('../utils/logger');

const sendTokenResponse = (user, statusCode, res) => {
    const token = user.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }
    res.status(statusCode).cookie('token', token, options).json({ success: true, token })
}

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, tel, role } = req.body

        const user = await User.create({
            name,
            email,
            password,
            tel,
            role: 'user'
        })

        sendTokenResponse(user, 200, res)
    } catch (err) {
        if (!handleValidationError(err, res)) {
            logError(err, req, 'Register');
            res.status(500).json({ success: false, msg: 'Internal server error' });
        }
    }
}

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Please provide an email and password" })
        }

        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ success: false, msg: "User not found" })
        }

        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res.status(401).json({ success: false, msg: "Invalid credentials" })
        }

        sendTokenResponse(user, 200, res)
    }
    catch (err) {
        logError(err, req, 'Login');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
}
exports.logout = (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        msg: 'User logged out'
    })
}

exports.assignAdminRole = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, msg: 'User not found' });
        }

        user.role = 'admin';
        await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        logError(err, req, 'Assign Admin Role');
        res.status(500).json({ success: false, msg: 'Internal server error' });
    }
};