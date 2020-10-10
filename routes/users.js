const router = require('express').Router();

const {
  readUsers, readUserById, createUser, updateUser, updateUserAvatar, login
} = require('../controllers/users');

// router.post('/', createUser);

router.get('/:id', readUserById);

router.get('/', readUsers);

router.patch('/me', updateUser);

router.patch('/me/avatar', updateUserAvatar);

module.exports = router;
