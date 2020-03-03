require('console.table');
var mysql = require('mysql');
var inquirer = require("inquirer");

var connection = mysql.createConnection({
	host: 'localhost',
	port: '3306',
	user: 'root',
	password: 'root',
	database: 'bamazon'
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connection successful!");
    makeTable();
  });
  
  function makeTable() {
    
    connection.query("SELECT * FROM products", function(err, res) {
      if (err) throw err;
      console.table(res);
      askSupervisor();
    });
  }
  
  function askSupervisor() {
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        }
      ])
      .then(function(val) {
        // Checking to see what option the user chose and running the appropriate function
        if (val.choice === "View Product Sales by Department") {
          viewSales();
        }
        else if (val.choice === "Create New Department") {
          addDepartment();
        }
        else {
          console.log("Goodbye!");
          process.exit(0);
        }
      });
  }
  
  function addDepartment() {
    // Asking the user about the department they would like to add
    inquirer
      .prompt([
        {
          type: "input",
          name: "name",
          message: "What is the name of the department?"
        },
        {
          type: "input",
          name: "overhead",
          message: "What is the overhead cost of the department?",
          validate: function(val) {
            return val > 0;
          }
        }
      ])
      .then(function(val) {
        
        connection.query(
          "INSERT INTO departments (department_name, over_head_costs) VALUES (?, ?)",
          [val.name, val.overhead],
          function(err) {
            if (err) throw err;
           
            console.log("ADDED DEPARTMENT!");
            makeTable();
          }
        );
      });
  }
  
  