
const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/images'); // Uploads will be stored in uploads/images directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '_' + uniqueSuffix + extension); // Unique filename
  }
});

const upload = multer({ storage });

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'images' // Ensure this database exists
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database:', err);
    throw err;
  }
  console.log('Connected successfully to MySQL database');
});

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all routes
app.use(express.static('uploads')); // Serve uploaded files statically

// Route to handle file upload and additional fields
app.post('/upload', upload.single('image'), (req, res) => {
  const { name, price, description } = req.body;
  const image = req.file.filename;

  // Insert into database
  const sql = 'INSERT INTO images (name, price, description, image) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, price, description, image], (err, result) => {
    if (err) {
      console.error('Error inserting image into database:', err);
      return res.status(500).json({ error: 'Error uploading image' });
    }
    return res.status(200).json({ status: 'success', filename: image });
  });
});

// Route to retrieve all images
app.get('/', (req, res) => {
  const sql = 'SELECT * FROM images';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error retrieving images from database:', err);
      return res.status(500).json({ error: 'Error retrieving images' });
    }
    return res.status(200).json(result);
  });
});


// app.get("/api/products/:id",(req,res)=>{
//   const productId=req.params.id;
//   EcomDb.query("SELECT * FROM products WHERE id = ?",[productId],(error,result)=>{
//     if(error) throw error;
//     if(result.length>0){
//     res.json(result[0])
//     } else{
//       res.status(404).send("Product Not Found")
//     }
//   })
// })

// //Add to Cart Page
// app.post("/api/cart/add",(req,res)=>{
//   const {productId}=req.body;
//   EcomDb.query("INSERT INTO cart (productid) value ?",[productId],(error,result)=>{
//     if(error){
//     console.log("Add to Cart Page Error",error);
//     res.status(500).send("Failled to add product to cart")
//     }
//     else{
//       console.log(result);
//    res.status(200).json("Product added in add to cart");
//     }
//   })
// })

// //Get cart count
// app.get('/api/cart/count', (req, res) => {
//   connection.query('SELECT COUNT(*) AS count FROM cart', (error, results) => {
//     if (error) {
//       console.error('Error fetching cart count:', error);
//       res.status(500).send('Failed to fetch cart count');
//     } else {
//       const count = results[0].count;
//       res.json({ count });
//     }
//   });
// });


// MySQL Database Ecom User Details
const dbcom = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'ecom'
});

dbcom.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL Database');
});



// MySQL Database Ecom User Details

// MySQL Database Ecom User Details

// Register 
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  try {

    const checkUserQuery = 'SELECT * FROM ecom WHERE email = ?';
    db.query(checkUserQuery, [email], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        res.status(400).send('User already exists');
      } else {
   
        const insertUserQuery = 'INSERT INTO ecom (name, email, password) VALUES (?, ?, ?)';
        dbcom.query(insertUserQuery, [name, email, password], (err, result) => {
          if (err) {
            throw err;
          }
          console.log(`User ${name} registered successfully`);
          res.status(200).send('User registered successfully');
        });
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Error registering user');
  }
});


// Login User
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  try {
    
    const selectUserQuery = 'SELECT * FROM ecom WHERE email = ? AND password = ?';
    dbcom.query(selectUserQuery, [email, password], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length === 0) {
        res.status(401).send('Invalid credentials');
      } else {
        res.status(200).send('Login successful');
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).send('Error logging in');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
