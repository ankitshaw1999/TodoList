//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose= require("mongoose");
const _ =require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const uri = "mongodb+srv://admin-ankit:admin-ankit@cluster0.x0acp.mongodb.net/todolistDB";
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema={
  name:String
};

const Item=mongoose.model("item",itemsSchema);

const item1=new Item({
  name:"welcome to the todoList"
});
const item2 = new Item({
  name: "Hit the + button to add item"
});

const item3 = new Item({
  name: "<---Hit it to delete an item"
});



const defaultItem=[item1,item2,item3];

const ListSchema={
  name:String,
  item:[itemsSchema]
};

const List=mongoose.model("List",ListSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0)
    {
      Item.insertMany(defaultItem, function (err) {
        if (err)
          console.log(err);
        else
          console.log("Insert SuccessFully");
      });
      res.redirect("/");
    }
    else
    res.render("list", { listTitle: "Today", newListItems: foundItems });
  })

 

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });


  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.item.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});



app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today")
  {
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err)
    console.log(err);
    else
    {
    console.log("Deleted Successfully");
    res.redirect("/");
    }
  });
}
else
{
  List.findOneAndUpdate({name:listName},{$pull:{item:{_id: checkedItemId}}},function(err,foundList){
    if(!err)
    res.redirect("/"+listName);
  })
}
})

app.get("/:customeListName", function(req,res){
  const customeListName= _.capitalize(req.params.customeListName);

  List.findOne({name: customeListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list = new List({
          name: customeListName,
          item: defaultItem
        });
        list.save();
        res.redirect("/"+customeListName);
      }
      else {
        res.render("list", { listTitle: customeListName , newListItems: foundList.item });
      }
    }
  });

  
 
}); 

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port " + port);
});
