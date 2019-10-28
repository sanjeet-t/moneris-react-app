const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const port = 3001;

const monerisRoute = require('./routes/moneris');

const app = express();
app.use(express.json());
app.use(cors());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);
app.use(bodyParser.json());
app.use('/moneris', monerisRoute);

app.get('/', (req, res) => {
  res.status(200).end(`Moneris API Server is up`);
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
