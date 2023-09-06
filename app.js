//jshint esversion:6
import express from "express";
import bodyParser from "body-parser";
// const date = require(__dirname + "/date.js");
import mongoose, { mongo } from "mongoose";
import _ from "lodash";
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-atchi:atchimongo@cluster0.0j9e1xp.mongodb.net/todolist");

const itemsSchema = {
  name: String
};

const listsSchema = {
  name: String,
  items: [itemsSchema]
}

const Item = mongoose.model("item", itemsSchema);
const List = mongoose.model("list", listsSchema);

const i1 = new Item({
  name: "Eat Burger"
});

const i2 = new Item({
  name: "Go to gym"
});

const i3 = new Item({
  name: "Learn something new"
});

const defaultItems = [i1, i2, i3];

app.get("/", function (req, res) {
  Item.find({}).
    then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: foundItems });
      }
    }).catch((err) => {
      console.log("Error", err);
    });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName })
    .then((foundItems) => {
      if (!foundItems) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }
      else {
        res.render("list", { listTitle: customListName, newListItems: foundItems.items });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const itemid = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(itemid)
      .then(() => {
        console.log("Successfully removed from DB");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  }
  else {
    List.findOneAndUpdate({ name: listName },
      { $pull: { items: { _id: itemid } } })
      .then(() => {
        res.redirect("/" + listName);
      });
  }
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});