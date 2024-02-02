import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  password: "Mydp#nayak09",
  port: 5432,
  database: "world",
});

db.connect();
let myarr = [];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
let currId= 1;
let users = [
  {id:1,name:"yash",color:"teal"},
  {id:2,name:"person2",color:"green"}, 
  {id:3,name:"Tisra Aadmi",color:"yellow"}, 
]
app.get("/countries",async (req,res)=>{
  const result = await db.query("SELECT * FROM countries");
  let arr1= result.rows.map(ele => (ele.country_name));
  res.json(arr1);
})

async function fun() {
  const ans1 = await db.query("SELECT country_code FROM visited_country JOIN users ON visited_country.users_id = users.id WHERE users_id = $1;",[currId]);
   console.log("first function ",ans1.rows);
  let arr = [];
  ans1.rows.forEach(ele => {
    arr.push(ele.country_code);
  });

  return arr;
};

async function fun2() {
  const val1 = await db.query("SELECT * FROM users");
   users = val1.rows;
   
   const val = users.find((user)=> user.id == currId);
   console.log("inside fun", val);
   return val;
}

app.get("/", async (req, res) => {
  //Write your code here.

  try {
    const arr = await fun();
    const currUser = await fun2();
    console.log(arr,"abc");
    console.log("xyz",currUser.color)
    res.render("index.ejs", {
      countries: arr,
      total: arr.length,
      users: users,
      color: currUser.color
    })
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500).json("there is problem loading this page");
  }
});

app.post("/add", async (req, res) => {
  try {
    const c_name = req.body.country;
    const curr_member = await fun2();
   console.log(c_name);
    const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [c_name]);
    const ans = result.rows[0]; //  because the result we are getting is in the from of the array so we are converting into the object
    console.log(ans.country_code);
    await db.query("INSERT INTO visited_country(country_code,users_id) VALUES($1,$2)", [ans.country_code,curr_member.id]);

    res.redirect("/");
  } catch (error) {

    console.log(error.message);
    res.sendStatus(500).json("there is problem loading this page");
  }
});

app.get("/add/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const birju = await db.query("SELECT country_code FROM visited_country WHERE country_code = $1", [id]);
    console.log("madarchod", birju?.rows[0]?.country_code);

    if (!birju?.rows[0]?.country_code) {
      await db.query("INSERT INTO visited_country(country_code) VALUES($1)", [id]);
    } else {
      await db.query("DELETE FROM visited_country WHERE country_code = $1", [id]);
    }
    
   const arr = await db.query("SELECT country_code FROM visited_country ");
   let arr1= arr.rows.map(ele => (ele.country_code));
   console.log("ben chod",arr1);
  res.redirect("/");
  } catch (error) {
    console.log(error.message);

    // Send an error response
    res.status(500).json("There is a problem processing your request");
  }
});


app.post("/user",(req,res)=>{
 try{
   if(req.body.add === "new"){
    console.log("succesfully got to the new page");
    res.render("new0.ejs");
   }else{
    currId = req.body.user;
    console.log("hello"+currId);  
    res.redirect("/");
   }

 }catch{
  console.log(error.message);
  res.sendStatus(404).json("there is problem at the srerver end");
 }
})


app.post("/new",async (req,res)=>{
try{
  const var2 = req.body.name; 
  const var1 = req.body.color;
  console.log(var1 + "and cloor is : " + var2);
  const arr = await db.query("INSERT INTO users(name, color) VALUES($1, $2) RETURNING* ;",
  [var2,var1]
  );
     currId = result.rows[0].id;
    console.log(currId);
     res.redirect("/");
  
}catch{
  console.log(error.message);
  res.sendStatus(400).json("there is error at our server :(");
}
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port} `);
});
