require('dotenv').config();
const app = require("./app");
const host = "0.0.0.0";
const port = process.env.PORT;

app.listen(port, host, () =>
  console.log(
    `The systems are running on the port ${port}`
  )
);
