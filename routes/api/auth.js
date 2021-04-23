const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const { check, validationResult} = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', auth, async  (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user)

    } catch (err) {
        console.log(err)
        res.status(500).send('Server error')
    }
})

router.post('/', 
    check('email', 'email is not valid').exists(),
    check('password', 'Password is required').isLength({ min: 6 }),
    async (req, res) => {
        const results = validationResult(req);
        if (!results.isEmpty()) {
            return res.status(400).json({results: results.array()})
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).send('Invalid credentials')
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).send('Invalid credentials')
            }

            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('jwtSecret'), {expiresIn: 360000}, (err, token) => {
                if (err) throw err
                res.json({token})
            })
        } catch (err) {
            console.log(err.message)
            res.status(500).json('server error')
        }
})

module.exports = router; 