const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Acesso negado.",
    });
  }

  try {
    const secret = process.env.SECRET;

    jwt.verify(token, secret);

    next();
  } catch (error) {
    res.status(400).json({
      message: "Token inválido.",
    });
  }
};

router.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  if (!name) {
    return res.status(422).json({
      message: "O nome é obrigatório",
    });
  }

  if (!email) {
    return res.status(422).json({
      message: "O e-mail é obrigatório",
    });
  }

  if (!password) {
    return res.status(422).json({
      message: "A senha é obrigatória",
    });
  }

  const userExists = await User.findOne({
    email,
  });

  if (userExists) {
    return res.status(422).json({
      message: `O e-mail "${email}" já está sendo usado. Por favor, escolha outro.`,
    });
  }

  // create password
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash(password, salt);

  // create a new User
  const user = new User({
    name,
    email,
    password: passwordHash,
  });

  try {
    await user.save();

    res.status(200).json({
      message: "Usuário criado com sucesso!",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Aconteceu um erro, por favor, tenta novamente.",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(422).json({
      message: "O e-mail é obrigatório",
    });
  }

  if (!password) {
    return res.status(422).json({
      message: "A senha é obrigatória",
    });
  }

  // check if user exists
  const user = await User.findOne({
    email,
  });

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }

  // check if password match
  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    return res.status(422).json({
      message: "Senha inválida.",
    });
  }

  try {
    const secret = process.env.SECRET;
    const token = jwt.sign(
      {
        id: user._id,
      },
      secret
    );

    res.status(200).json({
      message: "Autenticação realizada com sucesso.",
      token,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Aconteceu um erro, por favor, tenta novamente.",
    });
  }
});

router.get("/user/:id", checkToken, async (req, res) => {
  const id = req.params.id;

  // check if user exists
  const user = await User.findById(id, "-password");

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado.",
    });
  }

  res.status(200).json({ user });
});

module.exports = router;
