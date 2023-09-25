import express from "express";
import ejs from "ejs";
import fetch from "node-fetch";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import Student from "./models/student.js";
import methodOverride from "method-override";
const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

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

app.get("/studentApi", async (req, res) => {
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
app.get("/studentApi/:id", async (req, res) => {
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
      res.render("04.reject.ejs");
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
      { id },
      { id, name, age, scholarship: { merit, other } },
      { new: true, runValidators: true }
    );
    res.redirect(`/students/${id}`);
  } catch {
    res.render("04.studentFindError.ejs");
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

app.listen(3000, () => {
  console.log("Server is running on port 3000.");
});
