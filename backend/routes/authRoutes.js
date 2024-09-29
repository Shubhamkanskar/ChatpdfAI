const express = require('express');
const { register, login, checkUser } = require('../controllers/authControlles');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/check-user', checkUser); // New route to check if a user exists

module.exports = router;
