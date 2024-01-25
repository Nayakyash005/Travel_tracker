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
app.get("/countries",async (req,res)=>{
  const result = await db.query("SELECT * FROM countries");
  let arr1= result.rows.map(ele => (ele.country_name));
  res.json(arr1);
})

async function fun() {
  const ans1 = await db.query("SELECT country_code FROM visited_country");
  // console.log(ans1);
  let arr = [];
  ans1.rows.forEach(ele => {
    arr.push(ele.country_code);
  });

  return arr;
};

app.get("/", async (req, res) => {
  //Write your code here.

  try {
    const arr = await fun();
    res.render("index.ejs", {
      countries: arr,
      total: arr.length,
    })
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500).json("there is problem loading this page");
  }
});

app.post("/add", async (req, res) => {
  try {
    const c_name = req.body.country;
   console.log(c_name);
    const result = await db.query("SELECT country_code FROM countries WHERE country_name = $1", [c_name]);
    const ans = result.rows[0]; //  because the result we are getting is in the from of the array so we are converting into the object
    console.log(ans.country_code);
    await db.query("INSERT INTO visited_country(country_code) VALUES($1)", [ans.country_code]);

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
