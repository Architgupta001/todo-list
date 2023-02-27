const express = require('express');
const bodyParser = require('body-parser');
const date = require(__dirname + '/date')
const mongoose = require('mongoose');

require('dotenv').config({path : 'vars/.env'});
const password = process.env.PASSWORD

const app = express();
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.static('public'))

app.set("view engine", "ejs")

//Database Setup

mongoose.set('strictQuery', false)
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://admin-archit:'+ password +'@cluster0.gk2dhby.mongodb.net/todolistDB');
  console.log("Connected to MongoDB");
}  

const itemsSchema = new mongoose.Schema({
    name:{
       type: String,
       required: true
    }
        
})

const Item = mongoose.model("Item",itemsSchema)


const ListSchema = new mongoose.Schema({
    name:{
       type: String,
       required: true
    },
    items: [itemsSchema]     
});

const List = mongoose.model("List",ListSchema)

let currentDay = date();
app.get('/',(req,res)=>{
    
    Item.find({},(err,foundItems)=>{
      if(err){
        console.error();
      }else{
        res.render('index', {listTitle: currentDay, newListItems: foundItems});
      }
    })
})

app.post('/',(req,res)=>{
    let itemName = req.body.newItem;
    let listName = req.body.list;
    const itemAdd = new Item({
        name:itemName
    })
    
    if(listName === currentDay){
        itemAdd.save()
        res.redirect("/")
    }else{
        List.findOne({name:listName},(err,foundList)=>{
            foundList.items.push(itemAdd);
            foundList.save()
            res.redirect('/'+listName,)
        })
    }

})

app.post('/delete',(req,res)=>{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.list;

    if(listName === currentDay){
        Item.findByIdAndRemove(checkedItemId,(err)=>{
            if(err){
                console.error();
            }else{
                console.log("Successfully Deleted the document...");
                res.redirect("/")
            }
        })
    }else{
        List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkedItemId}}},(err,foundList)=>{
            if(!err){
                res.redirect('/'+listName)
            }
        })

    }

})

app.get('/:listName',(req,res)=>{
    const listName = req.params.listName
    
    List.findOne({name:listName},(err,foundList)=>{
        if(!err){
            if(!foundList){
                const list = new List({
                    name:listName,
                });
                list.save();
                res.redirect("/"+listName)
            } else{
                res.render("index", {listTitle: foundList.name, newListItems: foundList.items})
            }    
        }
    })
})

app.listen(3000,()=>{
    console.log("server started running at port 3000...");
})

