// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const express = require("express");

const DIST_DIR = path.join(__dirname, "dist");
const PORT = process.env.PORT || 3000;
const app = express();

// TODO remove
console.log("running on port: ", PORT);
//Serving the files on the dist folder
app.use(express.static(DIST_DIR));

//Send index.html when the user access the web
app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT);
