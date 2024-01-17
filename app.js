import express from "express";
import ejs from "ejs";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Student from "./models/student.js";
import methodOverride from "method-override";
import cookieParser from "cookie-parser";
import session from "express-session";
const app = express();

//app.use({
 // secret: "Should be an env variable but not for now",
 // resave: false,
  //saveUninitialized: false,
//});
app.set("view engine", "ejs");
app.use(cookieParser("WenwuLock"));
app.use("/", (req, res, next) => {
  // console.log(req.url);
  if (/\.(scss|map)$/.test(req.url)) {
    //  如果请求的 URL 以 .scss 或 .map 结尾，禁止访问
    res.status(200).send("Source Map is not accessible.");
  } else {
    // 否则，继续处理请求
    next();
  }
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
// app.use("/students", (req, res, next) => {
//   // req.method = "DELETE";
//   console.log(req.method);
//   // res.send("Middleware page.");
//   console.log("We reach this middleware.");
//   next();
// });
const studentsMiddleware = (req, res, next) => {
  console.log("This is students middleware.");
  next();
};

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

//redirect
app.get("/v", (req, res) => {
  res.redirect("https://loudness.info");
});

app.get("/cs", (req, res) => {
  res.redirect("https://meet.shenxunchat.com/joinRoom/cs");
});

app.get("/ex", (req, res) => {
  res.redirect("https://meet.shenxunchat.com/joinRoom/exercise");
});
//
//

app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/cookie", (req, res) => {
  // res.cookie("address", "Taiwan", { signed: true });
  // console.log(req.signedCookies);
  let { address } = req.signedCookies;
  console.log(req.signedCookies);
  // res.clearCookie(" address ");
  // let addressJSON = JSON.stringify(address);

  res.send(`Cookie has been send. ${address}`);
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

app.get("/studentsApi", async (req, res) => {
  try {
    let studentsData = await Student.find({});
    if (studentsData != "") {
      res.send(studentsData);
    } else {
      res.status(404).send({ studentsData: "The data not found." });
    }
  } catch {
    res.status(404).send({ studentsData: "The data not found." });
  }
});
app.get("/studentsApi/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let studentsData = await Student.findOne({ id });
    if (studentsData !== null) {
      res.send(studentsData);
    } else {
      res.status(404).send({ studentsData: "The data not found." });
    }
  } catch {
    res.status(404).send({ studentsData: "The data not found." });
  }
});

app.post("/studentsApi", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  let newStudent = new Student({
    id,
    name,
    age,
    scholarship: { merit, other },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.send({ message: "Successfully post a new student." });
    })
    .catch((error) => {
      // console.log(e);
      console.log(error.message);
      if (
        error.code == 11000 &&
        error.message.includes("E11000 duplicate key error collection")
      ) {
        res.send({ message: "Id is repeated." });
      } else {
        console.log("Student not accepted.");
        // console.log(e);
        // res.send({ message: "Some keys exceed the limit." });
        res.status(404).send(error);
      }
    });
});

app.put("/studentsApi", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndReplace(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    console.log(d);
    res.send({ message: "Data is being updated using the 'put' method." });
  } catch (e) {
    if (e.name === "ValidationError") {
      res.status(400).send({ message: "Validation error", errors: e.errors });
    } else {
      res.status(500).send({ message: "Internal server error", error: e });
    }
  }
});

app.patch("/studentsApi", async (req, res) => {
  console.log(req.body);
  let { id, name, age, merit, other } = req.body;
  try {
    let d = await Student.findOneAndUpdate(
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    console.log(d);
    if (d != null) {
      res.send({ message: "Data is being updated using the 'put' method." });
    } else {
      res.status(404).send({ message: "ID not found." });
    }
  } catch (e) {
    if (e.name === "ValidationError") {
      res.status(400).send({ message: "Validation error", errors: e.errors });
    } else {
      res.status(500).send({ message: "Internal server error", error: e });
    }
  }
});

app.delete("/studentsApi/all", (req, res) => {
  let d = Student.deleteMany({})
    .then((meg) => {
      console.log(meg);
      if (meg.deletedCount != 0) {
        res.send({ message: "Deleted all data successfully." });
      } else res.status(404).send({ message: "Delete has failed." });
    })
    .catch((e) => {
      console.log(meg);
      res.status(404).send({ message: "Delete has failed." });
    });
});

app.delete("/studentsApi/:id", (req, res) => {
  let { id } = req.params;
  let d = Student.deleteOne({ id })
    .then((meg) => {
      console.log(meg);
      if (meg.deletedCount != 0) {
        res.send({ message: "Deleted successfully." });
      } else res.status(404).send({ message: "Delete has failed." });
    })
    .catch((e) => {
      res.status(404).send({ message: "Delete has failed." });
    });
});

app.get("/students", async (req, res) => {
  try {
    let studentsData = await Student.find();
    res.render("04.studentsList.ejs", { studentsData });
  } catch {
    res.send("<h1>Error with finding data.</h1>");
  }
});

app.get("/students/insert", (req, res) => {
  res.render("04.studentInsert.ejs");
});

app.get("/students/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let personData = await Student.findOne({ id: id });
    if (personData !== null) {
      res.render("04.personalPage.ejs", { personData });
    } else {
      res.render("04.studentNotFound.ejs");
    }
  } catch {
    res.render("04.studentFindError.ejs");
  }
});

app.post("/students/insert", (req, res) => {
  let { id, name, age, merit, other } = req.body;
  // console.log(req.body);
  let newStudent = new Student({
    id: id,
    name: name,
    age: age,
    scholarship: {
      merit: merit,
      other: other,
    },
  });
  newStudent
    .save()
    .then(() => {
      console.log("Student accepted.");
      res.render("04.accept.ejs");
    })
    .catch((e) => {
      console.log("Student not accepted.");
      // console.log(e);
      if (e.code == 11000 && e.message.includes("E11000 duplicate key error")) {
        res.send(
          "<h1 style='color:red; font-size: 10rem'>The same ID is not allowed.</h1>"
        );
      } else {
        res.render("04.reject.ejs");
      }
    });
});

app.get("/students/edit/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let personData = await Student.findOne({ id });
    if (personData !== null) {
      res.render("04.studentEdit.ejs", { personData });
    } else {
      res.render("04.studentNotFound.ejs");
    }
  } catch {
    res.render("04.studentFindError.ejs");
  }
});
app.put("/students/edit/:id", async (req, res) => {
  let { id, name, age, merit, other } = req.body;
  try {
    let personData = await Student.findOneAndUpdate(
      req.params,
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch (e) {
    if (id != req.params.id && e.codeName == "DuplicateKey") {
      res.render("04.ErrorSameID.ejs");
    } else {
      res.render("04.studentFindError.ejs");
    }
  }
});

app.get("/students/delete/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let personData = await Student.findOne({ id });
    if (personData !== null) {
      res.render("04.studentDelete.ejs", { personData });
    } else {
      res.render("04.studentNotFound.ejs");
    }
  } catch {
    res.render("04.studentFindError.ejs");
  }
});

app.delete("/students/delete/:id", (req, res) => {
  let { id } = req.params;
  console.log(req.params);
  try {
    Student.deleteOne({ id })
      .then((meg) => {
        console.log(meg);
        res.render("04.deleteSuccessfully.ejs");
      })
      .catch((e) => {
        console.log(e);
        res.render("04.deleteFailed.ejs");
      });
  } catch {
    res.render("04.studentFindError.ejs");
  }
});

app.get("/truth", (req, res) => {
  function tag() {
    let inputString = "";
    let replacedString = inputString.replace(/，/g, ",");
    return replacedString;
  }

  res.send(`${tag()}`);
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
