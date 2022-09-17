const express = require("express");
const engine = require("express-handlebars");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const app = express();
let loginInfo = {
  login: false,
  user: {},
};
let alert = {
  torf: false,
  msg: "",
};
let notes;
let users = [
  {
    username: "admin",
    password: "admin",
  },
];
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "static")));
app.engine("handlebars", engine.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.get("/", function (req, res) {
  res.status(200).render("home", { loginInfo });
});
app.get("/contact", function (req, res) {
  res.send("Contact");
});
app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/userhome", (req, res) => {
  if (loginInfo.login === true) {
    res.redirect("userhome");
  } else {
    res.redirect("login");
  }
});
app.get("/edit", (req, res) => {
  res.redirect("userhome");
});
app.get("/delete", (req, res) => {
  res.redirect("userhome");
});
app.post("/edit", (req, res) => {
  if (loginInfo.login === true) {
    fs.readFile(`./notes/${loginInfo.user.username}.js`, (e, data) => {
      if (!e) {
        notes = data.toString("utf8").split("***");
        notes[req.body.id] = req.body.notes;
        let string = notes.join("***");
        fs.writeFile(`./notes/${loginInfo.user.username}.js`, string, () => {});

        res.status(200).render("usernotes", { loginInfo, notes });
      }
    });
  } else {
    res.redirect("login");
  }
  res.redirect("/notes");
});
app.post("/delete", (req, res) => {
  if (loginInfo.login === true) {
    fs.readFile(`./notes/${loginInfo.user.username}.js`, (e, data) => {
      if (!e) {
        // let notes=data..split('***')
        notes = data.toString("utf8").split("***");
        let notesArray = Array.from(notes);
        notesArray.forEach((e, i) => {
          if (e === req.body.note) {
            notesArray.splice(i, 1);
            let string = notesArray.join("***");
            fs.writeFile(
              `./notes/${loginInfo.user.username}.js`,
              string,
              () => {}
            );
alert.torf=true
alert.msg="Note Deleted Successfully Kindly clickUpdate notes"
            res.render("usernotes", { loginInfo, notes });
          }
        });
      }
    });
  } else {
    res.redirect("login");
  }
});
app.get("/notes", (req, res) => {
  if (loginInfo.login === true) {
    fs.readFile(`./notes/${loginInfo.user.username}.js`, (e, data) => {
      if (e) {
        alert.torf = true;
        alert.msg = "Nothing Found Here Add Some Notes";
      } else {
        notes = data.toString("utf8").split("***");
      }
      res.render("usernotes", { loginInfo, notes });
    });
  } else {
    res.redirect("login");
  }
});
app.post("/notes", (req, res) => {
  if (loginInfo.login === true && req.body.notes) {
    fs.readFile(`./notes/${loginInfo.user.username}.js`, (e, data) => {
      if (e) {
        fs.appendFile(
          `./notes/${loginInfo.user.username}.js`,
          `***${req.body.notes}`,
          () => {}
        );
        notes = `!${loginInfo.user.username}!***${req.body.notes}`;
        alert.torf = true;
        alert.msg = "Note Added";

        res.render("usernotes", { loginInfo, alert });
      } else {
        fs.appendFile(
          `./notes/${loginInfo.user.username}.js`,
          `***${req.body.notes}`,
          () => {}
        );

        fs.readFile(`./notes/${loginInfo.user.username}.js`, (e, note) => {
          notes = note.toString("utf8");
        });
        alert.torf = true;
        alert.msg = "Note Added";
        res.status(200).render("usernotes", { loginInfo, alert, notes });
      }
    });
  } else if (!req.body.notes) {
    res.send("Kindly Enter Notes");
  } else {
    res.redirect("login");
  }
});
app.post("/login", function (req, res) {
  if (!req.body.username || !req.body.password) {
    alert.torf = true;
    alert.msg = "Username and Password are required";
    res.render("login", { alert });
  } else {
    let user = users.filter((user) => {
      return user.username === req.body.username;
    });
    if (user.length === 0) {
      alert.torf = true;
      alert.msg = "User Doesn't Exist Kindly Signup";
      res.render("login", { alert });
    }
    user.forEach((e) => {
      if (e.password === req.body.password) {
        // console.log(loginInfo)
        loginInfo.login = true;
        loginInfo.user = e;
        // console.log(loginInfo)
        res.redirect("userhome");
      } else {
        alert.torf = true;
        alert.msg = "Invalid Username or Password ";
        res.status(200).render("login", { alert });
      }
    });
  }
});

app.get("/userhome", (req, res) => {
  if (loginInfo.login === true) {
    // console.log(loginInfo)
    res.status(200).render("userhome", { loginInfo, notes });
  } else {
    res.redirect("login");
  }
});
app.post("/signup", function (req, res) {
  if (!req.body.username || !req.body.password) {
    alert.torf = true;
    alert.msg = "Username and Password are required";
    res.render("signup", { alert });
  } else {
    let user = users.filter((user) => {
      return user.username === req.body.username;
    });
    if (user.length === 0) {
      users.push({ username: req.body.username, password: req.body.password });
      alert.torf = true;
      alert.msg = "User Created Kindly Login";
      res.render("signup", { alert });
    } else {
      alert = {
        torf: true,
        msg: "Username exist kindly Choose Another One",
      };
      res.render("signup", { alert });
    }
  }
});
app.get("/signup", function (req, res) {
  res.render("signup");
});
app.get("/logout", (req, res) => {
  loginInfo.login = false;
  loginInfo.user = "";
  notes = "";
  alert.torf = true;
  alert.msg = "Logout Successfully";
  res.redirect("login");
});
app.get('*', function(req, res){
  res.status(404).render('error');
});
app.listen(80, () => {
  console.log("http://localhost");
});
