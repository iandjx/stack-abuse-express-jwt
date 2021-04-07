const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const app = express();

const accessTokenSecret = "somerandomaccesstoken";
const refreshTokenSecret = "somerandomstringforrefreshtoken";

const users = [
  {
    username: "john",
    password: "password123admin",
    role: "admin",
  },
  {
    username: "anna",
    password: "password123member",
    role: "member",
  },
];

const refreshTokens = [];

app.use(bodyParser.json());

app.post("/login", (req, res) => {
  // console.log(req);
  // read username and password from request body
  const { username, passwor, provider, githubUser } = req.body;

  // filter user from the users array by username and password
  const user = users.find((u) => {
    return u.username === username && u.password === password;
  });

  if (provider === "github") {
    const newUser = {
      username: githubUser.name,
      role: "admin",
    };
    users.push({
      ...newUser,
    });

    console.log(users);
    const accessToken = jwt.sign({ ...newUser }, accessTokenSecret, {
      expiresIn: "20m",
    });
    const refreshToken = jwt.sign({ ...newUser }, refreshTokenSecret, {
      expiresIn: "3d",
    });

    refreshTokens.push(refreshToken);

    return res.json({
      accessToken,
      refreshToken,
    });
  }

  if (user) {
    // generate an access token
    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: "20m" }
    );
    const refreshToken = jwt.sign(
      { username: user.username, role: user.role },
      refreshTokenSecret,
      { expiresIn: "3d" }
    );

    refreshTokens.push(refreshToken);

    return res.json({
      accessToken,
      refreshToken,
    });
  } else {
    return res.send("Username or password incorrect");
  }
});

app.post("/token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.sendStatus(401);
  }

  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }

  jwt.verify(token, refreshTokenSecret, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    const accessToken = jwt.sign(
      { username: user.username, role: user.role },
      accessTokenSecret,
      { expiresIn: "20m" }
    );

    res.json({
      accessToken,
    });
  });
});

app.post("/logout", (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((token) => t !== token);

  res.send("Logout successful");
});

app.listen(3001, () => {
  console.log("Authentication service started on port 3001");
});
