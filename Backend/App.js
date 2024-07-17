
const express = require('express');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const { error } = require('console');

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
app.use(express.json()); 
app.use(cors()); 
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


// Route to retrieve an image by ID
app.get('/image/:id', (req, res) => {
  const imageId = req.params.id;
  console.log(imageId);
  const sql = 'SELECT * FROM images WHERE id = ?';
  db.query(sql, [imageId], (err, result) => {
    if (err) {
      console.error('Error retrieving image from database:', err);
      return res.status(500).json({ error: 'Error retrieving image' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    return res.status(200).json(result[0]);
  });


});

// button Add to Cart

app.post("/api/cart/add/", (req, res) => {
  // const { id } = req.body;
  console.log(`Add to Cart Page ID: ${imageId}`);

  // Retrieve product details from 'images' table
  // const sql = 'SELECT id, name, image, price, description FROM images WHERE id = ?';
const sql="INSERT INTO cart (productid,image,description,name,price) SELECT id,name,image,price,description FROM images WHERE id=?"
  db.query(sql, [imageId], (err, results) => {
    if (err) {
      console.error('Error retrieving product from images table:', err);
      return res.status(500).json({ error: 'Error retrieving product' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Insert product into 'cart' table
    const cartSql = 'INSERT INTO cart (productid, name, image, price, description) VALUES (?, ?, ?, ?, ?)';
    const  {id, name,image, price, description}=req.body
    
    db.query(cartSql, [id, name,image, price, description], (error, cartResult) => {
      if (error) {
        console.error('Error adding product to cart:', error);
        return res.status(500).json({ error: 'Error adding product to cart' });
      }

      console.log('Product added to cart successfully:', cartResult);
      res.status(200).json({ status: 'success', product });
    });
  });
});

app.post("/api/cart/add/", (req, res) => {

  const {id,name,image,price,description}=req.body;

  // const sql="INSERT INTO cart (image,productid,name,price,)SELECT name, age FROM table1 WHERE id = 1"; 
});



//featch all cart items
app.get("/api/cart/add/", (req, res) => {
  const sql = 'SELECT * FROM cart';
  db.query(sql,(error,result)=>{
    if(error){
      console.log("error ",error);
      return res.status(500).json({error:"Error Aquired"});
    }
    return res.status(200).json(result);
  });
});

//Delete Product by Id
app.delete("/api/cart/delete/:id",(req,res)=>{
  const id=req.params.id;
  console.log(id);
  const sql ="delete from cart where id = ? ";
  // const ql="DELETE FROM cart WHERE `cart`.`id` = ?"
  db.query(sql,id,(err,result)=>{
    if (err) {
      // throw err;
      console.log("error Aquired" ,id);
      return res.status(500).json({error:"error Aquired",err});
    }
    else if(result.length==0){
      return res.status(404).json({result:"not found",result});
    }
    // return res.status(200).json("true");
    return res.status(200).send("true");

  })
})

// cart Counting in Nav Bar
app.get('/api/cart/count', (req, res) => {
  db.query('SELECT COUNT(*) AS count FROM cart', (error, results) => {
    if (error) {
      console.error('Error fetching cart count:', error);
      res.status(500).send('Failed to fetch cart count');
    } else {
      const count = results[0].count;
      res.json({ count });
    }
  });
});



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
    dbcom.query(checkUserQuery, [email], (error, results) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        res.status(400).send('User already exists');
      } 
      else {
   
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
  } 
  catch (error) {
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
