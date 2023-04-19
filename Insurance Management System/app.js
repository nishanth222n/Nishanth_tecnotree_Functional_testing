const express = require('express')
const app = express()
const mysql = require('mysql');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');

app.set('view engine', 'ejs');
app.use(flash());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true
  }));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'insurance'
});

app.get('/login',(req,res)=>{
    res.render('login',{messages:req.flash()})
})

app.get('/',(req,res)=>{
    res.render('home',{messages:req.flash()})
})

app.get('/register',(req,res)=>{
    res.render('register',{messages:req.flash()})
})

app.get('/contact',(req,res)=>{
    res.render('contact',{messages:req.flash()})
})


app.get('/policy_purchased',(req,res)=>{
    res.render('policy_purchased',{messages:req.flash()})
})

app.get('/claims',(req,res)=>{
    res.render('claims',{messages:req.flash()})
})

app.get('/adminhome',(req,res)=>{
    res.render('adminhome',{messages:req.flash()})
})



app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    if(email ==='admin@gmail.com' && password==='admin'){
        req.flash('success', 'Welcome to Admin Page');
        req.session.email='admin@gmail.com';
        req.session.pass='admin';
        res.redirect('/adminhome')}
  
    // query the database to check if the username and password are correct
    connection.query('SELECT * FROM customer WHERE  email_address= ? AND password = ?', [email, password], (error, results, fields) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        // if the credentials are correct, redirect to the profile page
        req.session.customer_id = results[0].customer_id
        res.redirect('/customerhome');
      } else {
        // if the credentials are incorrect, display an error message
        res.send('Invalid email or password');
      }
    });
  });

app.post('/register', function(req, res) {
  // Get the customer information from the request body
  const { name, email, phone, password } = req.body;

  // Insert the customer data into the MySQL database
  const sql = 'INSERT INTO customer (name, email_address, phone_number, password) VALUES (?, ?, ?, ?)';
  connection.query(sql, [name, email, phone, password], function(err, result) {
    if (err) throw err;
    res.send('Customer added successfully!');
  });
});

app.post('/policy_purchased', function(req, res) {
  // Get the policy information from the request body
  const { policy_type, insured_item, coverage_amount, payment_method, customer_id } = req.body;

  // Insert the policy data into the MySQL database
  const sql = 'INSERT INTO policy_purchased(policy_type, insured_item, coverage_amount, payment_method, customer_id) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [policy_type, insured_item, coverage_amount, payment_method, customer_id], function(err, result) {
    if (err) throw err;
    res.send('Policy added successfully!');
  });
});

app.post('/claims', function(req, res) {
  // Get the claim information from the request body
  const { claim_status, claim_date, claim_description, policy_id, customer_id } = req.body;

  // Insert the claim data into the MySQL database
  const sql = 'INSERT INTO claims (claim_status, claim_date, claim_description, policy_id, customer_id) VALUES (?, ?, ?, ?, ?)';
  connection.query(sql, [claim_status, claim_date, claim_description, policy_id, customer_id], function(err, result) {
    if (err) throw err;
    res.send('Claim added successfully!');
  });
});

app.get('/customers', function(req, res) {
    const sql = 'SELECT * FROM customer;'
    connection.query(sql, function(err, rows, fields) {
      if (err) throw err;
      res.render('customers', { customers: rows });
    });
  });

  app.post('/customer/:id/delete', function(req, res) {
    const customerId = req.params.id;
  
    // Delete the customer record from the database
    const sql = 'DELETE FROM customer WHERE customer_id = ?';
    connection.query(sql, [customerId], function(err, result) {
      if (err) throw err;
      res.redirect('/customers');
    });
  });
  
  

function authenticated(req, res, next){
    if (req.session.user) {
      // User is logged in, proceed to the next middleware or route handler
      next();
    } else {
      // User is not logged in, redirect to login page or send an error response
      res.redirect('/login');
    }
  };

  function authenticatedCheck(req, res, next){
    if (!req.session.user) {
      // User is logged in, proceed to the next middleware or route handler
      next();
    } else {
      // User is not logged in, redirect to login page or send an error response
      res.redirect('/user/home');
    }
  };



app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
      if (err) {
        console.error(err);
      } else {
        res.redirect('/');
      }
    });
  });





app.listen(3000,(req,res)=>{
    console.log("listening of port 3000")
})
