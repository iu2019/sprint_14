const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { NODE_ENV,JWT_SECRET } = process.env;

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

const readUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(500).send({ message: 'На сервере произошла ошибка' }));
};

const readUserById = (req, res) => {
  let errStatus = 400;
  User.findById(req.params.id)
    .orFail(() => {
      errStatus = 404;
      throw new ValidationError('Нет пользователя с таким id');
    })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      res.status(errStatus).send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then(hash=>
      User.create({ name, about, avatar, email, password:hash }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => res.status(400).send({ message: 'Ошибка валидации полей пользователя' }));
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  let errStatus = 400;

  User.findByIdAndUpdate(req.user._id, { name, about })
    .orFail(() => {
      errStatus = 500;
      throw new ValidationError('Ошибка сервера - обновление не удалось сохранить');
    })
      .then(() => res.status(200).send({ data: { name, about } }))
      .catch((err) => res.status(errStatus).send({ message: err.message }));

};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  let errStatus = 400;

  User.findByIdAndUpdate(req.user._id, { avatar })
    .orFail(() => {
      errStatus = 500;
      throw new ValidationError('Ошибка сервера - обновление не удалось сохранить');
    })
    .then(() => res.status(200).send({ data: { avatar } }))
    .catch((err) => res.status(errStatus).send({ message: err.message }));

};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user)=>{
      const token = jwt.sign({_id:user.id},
        NODE_ENV === 'production'? JWT_SECRET:'dev-super-duper-secret',
        {expiresIn: '7d'});
      res.cookie('jwt', token, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: true,
      })
      .end();
    })
    .catch((err)=>{
      res
        .status(401)
        .send({ message: err.message });

    })
};

module.exports = {
  readUsers, readUserById, createUser, updateUser, updateUserAvatar, login,
};
