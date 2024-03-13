import "dotenv/config";
import express from "express";
import fetch from "node-fetch";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { fileURLToPath } from "url";
import { dirname } from "path";
import studentsRouter from "./routers/studentsRouter.js";
import redirect from "./routers/redirect.js";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// app.set("views", "views");
app.use("/", (req, res, next) => {
  if (/\.(scss|map)$/.test(req.url)) {
    //  如果请求的 URL 以 .scss 或 .map 结尾，禁止访问
    res.status(200).send("Source Map is not accessible.");
  } else {
    next();
  }
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(cookieParser("process.env.SECRET"));
app.use(
  session({
    secret: "process.env.SECRET",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use("/students", studentsRouter);
app.use("/redirect", redirect);

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/test", (req, res) => {
  res.render("test.ejs");
});

app.get("/fusen", (req, res) => {
  res.sendFile("/fusen/index.html");
});

app.get("/signup", (req, res) => {
  res.render("signup.ejs");
});

app.get("/session", (req, res) => {
  console.log(process.env.SECRET);
  req.flash("success_msg", "Successfully get to the homepage.");
  res.send("Hi, " + req.flash("success_msg"));
});

app.get("/verifyUser", (req, res) => {
  req.session.isVerified = true;
  console.log(req.session);
  res.send("<h1>You are verified.</h1>");
});

app.get("/secret", (req, res) => {
  if (req.session.isVerified == true) {
    res.send("<h1>Here is my secret - I Love You ~ ~ 😘😘</h1>");
  } else {
    console.log(req.session);
    res.status(403).send("<h1>You are not authorized to see my secret!😡</h1>");
  }
});

app.get("/index.html", (req, res) => {
  res.render("index.ejs");
});
app.get("/numberToGuess", (req, res) => {
  res.render("01.numberToGuess.ejs");
});

app.get("/weather", (req, res) => {
  res.render("02.weatherApiHomePage.ejs");
});

app.get("/weather/:city", async (req, res) => {
  //k to cel
  function kToC(k) {
    return (k - 273.15).toFixed(2);
  }
  const myKey = "01920cd20a4f0007ddd080a84ca498e8";
  let { city } = req.params;
  let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${myKey}`;
  const response = await fetch(url);
  const weatherData = await response.json();

  console.log(weatherData);

  // 檢查API是否返回了一個成功的響應
  if (weatherData.cod !== 200) {
    // 如果API返回了一個錯誤，回應用戶
    return res.status(404).render("404.ejs" || "City not found");
  }

  let { temp } = weatherData.main;
  let newTemp = kToC(temp);
  res.render("02.weatherApi.ejs", { weatherData, newTemp });
});

app.get("/joke", async (req, res) => {
  const url = "https://v2.jokeapi.dev/joke/Any";
  const response = await fetch(url);
  const jokeData = await response.json();

  console.log(jokeData);

  if (jokeData.error !== false) {
    return res.status(404).render("404.ejs");
  }

  let { type, joke, setup, delivery } = jokeData;

  res.render("03.joke.ejs", { joke, setup, delivery });
});

app.get("/layout", (req, res) => {
  res.sendFile("/layout/index.html");
});

app.get("/*", (req, res) => {
  res.status(404).render("404.ejs");
});
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Somethong is broken. We will fix it soon");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
