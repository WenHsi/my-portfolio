import express from "express";
import mongoose from "mongoose";
import Student from "../models/student.js";
const router = express.Router();

mongoose
  .connect("mongodb://localhost:27017/studentDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Successfully connected to mongoDB of studentDB.");
  })
  .catch((e) => {
    console.log("Connection failed.");
    console.log(e);
  });

// const studentsMiddleware = (req, res, next) => {
//   console.log("This is students middleware.");
//   next();
// };

router.get("/Api", async (req, res) => {
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
router.get("/Api/:id", async (req, res) => {
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

router.post("/Api", (req, res) => {
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

router.put("/Api", async (req, res) => {
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

router.patch("/Api", async (req, res) => {
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

router.delete("/Api/all", (req, res) => {
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

router.delete("/Api/:id", (req, res) => {
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

router.get("/", async (req, res) => {
  try {
    let studentsData = await Student.find();
    res.render("04.studentsList.ejs", { studentsData });
  } catch {
    res.send("<h1>Error with finding data.</h1>");
  }
});

router.get("/insert", (req, res) => {
  res.render("04.studentInsert.ejs");
});

router.get("/:id", async (req, res) => {
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

router.post("/insert", (req, res) => {
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

router.get("/edit/:id", async (req, res) => {
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
router.put("/edit/:id", async (req, res) => {
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

router.get("/delete/:id", async (req, res) => {
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

router.delete("/delete/:id", (req, res) => {
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

export default router;
