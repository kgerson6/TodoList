//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-kevin:hnqKsOZ89@cluster0-bensx.mongodb.net/todolistDB', {
  useNewUrlParser: true
});

const itemSchema = {
  name: {
    type: String,
    required: true
  }
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Enter your items and hit + to add a new item."
});

const item3 = new Item({
  name: "<= Hit on this to mark as completed"
});

const item4 = new Item({
  name: "You may create new Schedule pages by tapping in the link bar and add a name at the end"
});

const defaultItems = [item1, item2, item3, item4];

//creating a list Schema
const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, (err, foundItems) => {
    if (foundItems.length === 0) {

      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added items to todolistDB");
        }
      });
      res.redirect("/");
    }
    res.render("list", {
      listTitle: "Today",
      newListItems: foundItems
    });
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, (err, foundList) => {

    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  });

});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;




  const item = new Item({
    name:itemName
  });


  if(listName==="Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName},(err, foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  });
}
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if(!err){
        console.log("Successfully removed " + checkedItemId + " from the list");
        res.redirect("/");
      }
    });
  }else{
     List.findOneAndUpdate({name: listName}, {$pull:{items:{_id: checkedItemId}}}, (err, foundList)=>{
       if(!err){
         res.redirect("/" + listName);
       }
     });
  }
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT||3000, ()=>{
  console.log("Server is running at port 3000");
});
