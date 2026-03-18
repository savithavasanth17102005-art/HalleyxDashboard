
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");  
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});
const db = mysql.createConnection({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

db.connect(err => {
  if(err){
    console.log("DB Error:", err);
  }else{
    console.log("MySQL Connected ✅");
  }
});


app.get("/", (req, res)=>{
  res.send("Server running 🚀");
});




app.post("/register", (req, res) => {

  const { name, email, password, role } = req.body;

  if(!name || !email || !password){
    return res.json({ success:false, message:"All fields required" });
  }

  
  db.query("SELECT * FROM users WHERE email = ?", [email], (err, result) => {

    if(err){
      console.log("Query Error:", err);
      return res.json({ success:false, message:"DB error" });
    }

    if(result.length > 0){
      return res.json({ success:false, message:"Email already exists" });
    }

    
    db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role],
      (err, result) => {

        if(err){
          console.log(err);
          return res.json({ success:false, message:"DB error" });
        }

        res.json({ success:true, message:"Registered successfully" });

      }
    );

  });

});


app.post("/login", (req, res) => {

  const { email, password, role } = req.body;

  if(!email || !password){
    return res.json({ success:false, message:"Enter email & password" });
  }

  db.query(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, result) => {

      if(err){
        console.log(err);
        return res.json({ success:false, message:"DB error" });
      }

      if(result.length === 0){
        return res.json({ success:false, message:"Invalid credentials" });
      }

      let user = result[0];

      
      if(user.role !== role){
        return res.json({ success:false, message:"Wrong role selected" });
      }

      

res.json({
  success:true,
  user:user
});

    }
  );

});


app.post("/add-order", (req, res) => {

  const order = req.body;

  const sql = `
    INSERT INTO orders 
    (firstName, lastName, email, phone, address, city, state, postal, country, product, quantity, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    order.firstName,
    order.lastName,
    order.email,
    order.phone,
    order.address,
    order.city,
    order.state,
    order.postal,
    order.country,
    order.product,
    order.quantity,
    order.total
  ], (err, result) => {

    if(err){
      console.log("Order Error:", err);
      return res.json({ success:false });
    }

    res.json({ success:true });

  });

});


app.get("/orders", (req, res) => {

  db.query("SELECT * FROM orders", (err, result) => {

    if(err){
      console.log("Fetch Error:", err);
      return res.json([]);
    }

    res.json(result);

  });

});
app.delete("/delete-order/:id", (req, res) => {

  const id = req.params.id;

  db.query("DELETE FROM orders WHERE id = ?", [id], (err, result) => {

    if(err){
      console.log("Delete Error:", err);
      return res.json({ success:false });
    }

    res.json({ success:true });

  });

});


app.get("/dashboard-data", (req, res) => {

  
  const totalOrdersQuery = "SELECT COUNT(*) AS totalOrders FROM orders";

  
  const revenueQuery = "SELECT SUM(total) AS totalRevenue FROM orders";


  const productQuery = `
    SELECT product, SUM(quantity) AS totalQty
    FROM orders
    GROUP BY product
  `;

  db.query(totalOrdersQuery, (err, totalRes) => {

    if(err){
      console.log(err);
      return res.json({ success:false });
    }

    db.query(revenueQuery, (err, revenueRes) => {

      if(err){
        console.log(err);
        return res.json({ success:false });
      }

      db.query(productQuery, (err, productRes) => {

        if(err){
          console.log(err);
          return res.json({ success:false });
        }

        res.json({
          totalOrders: totalRes[0].totalOrders,
          totalRevenue: revenueRes[0].totalRevenue || 0,
          products: productRes
        });

      });

    });

  });

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});