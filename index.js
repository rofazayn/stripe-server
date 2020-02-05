const express = require("express");
const bodyParser = require("body-parser");
const stripe = require("stripe")("SECRET_API_KEY_HERE");

const app = express();
const port = 8000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello world!");
});

app.post("/donate", (req, res) => {
  const { name, email, number, exp_month, exp_year, cvc, amount } = req.body;

  getToken(number, exp_month, exp_year, cvc)
    .then(token => {
      chargeDonation(amount, token.id, name, email)
        .then(success => res.send(success))
        .catch(err => res.send(err));
    })
    .catch(err => res.send(err));
});

const getToken = async (number, exp_month, exp_year, cvc) => {
  const token = await stripe.tokens.create({
    card: {
      number,
      exp_month,
      exp_year,
      cvc
    }
  });

  return token;
};

const chargeDonation = async (amount, tokenId, name, email) => {
  const donation = await stripe.charges.create({
    amount: amount * 100,
    source: tokenId,
    currency: "usd",
    description: `Donation from ${name}, email: ${email}`
  });

  return donation;
};

app.get("/balance", (req, res) => {
  stripe.balance
    .retrieve()
    .then(balance => res.send(balance))
    .catch(err => res.send(err));
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
