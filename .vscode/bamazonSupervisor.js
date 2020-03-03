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
   
  });
  
  
    inquirer
      .prompt([
        {
          type: "list",
          name: "choice",
          message: "What would you like to do?",
          choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        }
      ])
      .then(function(answers) {
        // Checking to see what option the user chose and running the appropriate function
        if (answers.choice === "View Product Sales by Department") {
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
      ]).then(function(answer){
        connection.query("INSERT INTO departments SET ?", 
        {
            department_name: answer.name,
            over_head_costs: answer.cost
        }, function(err, res){
            if (err) throw err;
        })
        connection.query("SELECT * FROM departments", function (err, res){
            if (err) throw err;

            var table = new Table({
                head: ["department_id", "department_name", "over_head_costs"]
            });

            for (var i = 0; i < res.length; i++){
                table.push([res[i].department_id, res[i].department_name, res[i].over_head_costs])
            }
            console.log("Your updates!")
            console.log(table.toString());
        })
    })

};
      
  function viewSales() {
    //join select statement
    connection.query("SELECT department_id, d.department_name, over_head_costs, sum(product_sales) AS product_sales, (sum(product_sales) - over_head_costs) AS total_profit FROM departments d INNER JOIN products p ON d.department_name = p.department_name GROUP BY department_name", function(err, res){
        if (err) throw err;
        //set up table head
        var table = new Table({
            head: ["department_id", "department_name", "over_head_costs", "products_sales", "total_profits"]
        });
        //cycle through res and print out values in table
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit])
        }
        console.log(table.toString());
    })
}
  