const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');

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
  database: 'bank'
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

app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // query the database to check if the username and password are correct
    connection.query('SELECT * FROM accountholder WHERE username = ? AND password = ?', [username, password], (error, results, fields) => {
      if (error) {
        throw error;
      }
      if (results.length > 0) {
        // if the credentials are correct, redirect to the profile page
        req.session.account_number = results[0].account_number
        req.session.balance = results[0].balance
        res.redirect('/profile');
      } else {
        // if the credentials are incorrect, display an error message
        res.send('Invalid username or password');
      }
    });
  });


app.get('/profile', (req, res) => {
    res.render('profile',{messages:req.flash(),balance:req.session.balance})
  });


app.post('/register', (req, res) => {
    const accountHolderName = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const accountType = req.body.accountType;
    const username = req.body.username;
    const address = req.body.address;
    const phoneNumber = req.body.phone;
   
    let minm = 1000000;
    let maxm = 9999999;
    account_number = Math.floor(Math.random() * (maxm - minm + 1)) + minm;

    // Create an INSERT statement for the accountholder table
    const insertQuery = `INSERT INTO accountholder (account_number, account_holder_name, email, password, account_type, balance, username, address, phone_number) VALUES (${account_number}, '${accountHolderName}', '${email}', '${password}', '${accountType}', 0, '${username}', '${address}', '${phoneNumber}')`;
    // Execute the INSERT statement
    connection.query(insertQuery, (error, results, fields) => {
      if (error) {
        console.log('Failed to insert account holder:', error);
        console.log(results)
        res.redirect('/register');
      } else {
        console.log(results)
      
        console.log('Inserted account holder with account number:', account_number);
        res.redirect('/login')
      }
    });
  });

  app.post('/add-amount', (req, res) => {
    const amountToAdd = parseInt(req.body.amount); // get the amount to add from the request body
    const query = `UPDATE accountholder SET balance = balance + ? WHERE account_number = ${req.session.account_number}`; // update the balance of the account with id 1
    connection.query(query, amountToAdd, (err, result) => {
      if (err) {
        console.error('Error adding amount: ', err);
        res.status(500).send('Error adding amount.');
        return;
      }
  
      console.log('Amount added successfully.');
      res.send('Amount added successfully.');
    });
  });

  app.post('/withdraw-amount', (req, res) => {
    const amountTowithdraw = parseInt(req.body.amount); // get the amount to add from the request body
    const query = `UPDATE accountholder SET balance = balance - ? WHERE account_number = ${req.session.account_number}`; // update the balance of the account with id 1
    connection.query(query, amountTowithdraw, (err, result) => {
      if (err) {
        console.error('Error withdraw amount: ', err);
        res.status(500).send('Error withdraw amount.');
        return;
      }
  
      console.log('Amount withdraw successfully.');
      res.send('Amount withdraw successfully.');
    });
  });
  

  app.listen(3000,(req,res)=>{
    console.log("listening of port 3000")
})

