var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    menuPrompt();
});

menuPrompt = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "Select an action from the following options",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit App"],
            name: "menu"
        }
    ]).then(function (action) {
        if (action.menu === "View Products for Sale") {
            displayItems();
        } else if (action.menu === "View Low Inventory") {
            displayLowInventory();
        } else if (action.menu === "Add to Inventory") {
            addToInventory();
        } else if (action.menu === "Add New Product") {
            addNewProduct();
        } else if (action.menu === "Exit App") {
            connection.end();
        }
    })
};

nextOrExitPrompt = () => {
    inquirer.prompt([
        {
            type: "list",
            message: "Do you want to... ",
            choices: ["Go back to main menu", "Exit App"],
            name: "ExitPrompt"
        }
    ]).then(function(res) {
        if (res.ExitPrompt === "Go back to main menu") {
            menuPrompt();
        } else {
            connection.end();
        };
    });
};

function displayItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        console.log("\n ----- Items for Sale ----- \n");
        for (i = 0; i < res.length; i++) {
            console.log("Item-id : " + res[i].item_id + "\nProduct : " + res[i].product_name + "\nPrice : $" + res[i].price + "\nStock Quantity : " + res[i].stock_quantity + "\n-----------------\n");
        };
        nextOrExitPrompt();
    })
};

function displayLowInventory() {
    connection.query("SELECT * FROM products Where stock_quantity < 100", function (err, res) {
        if (err) throw err;

        console.log("\n ----- Low Inventory Items ----- \n");
        for (var i = 0; i < res.length; i++) {
            console.log("Item-id : " + res[i].item_id + "\nProduct : " + res[i].product_name + "\nPrice : $" + res[i].price + "\nStock Quantity : " + res[i].stock_quantity + "\n-----------------\n");
        }
        nextOrExitPrompt();
    })
};

function addToInventory() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the Item-ID of the product you want to add inventory in",
            name: "ItemToAdd",
            validate: (value) => {
                if (!isNaN(value) && value > 0) {
                    return true;
                } else {
                    return false;
                };
            },
        },
        {
            type: "input",
            message: "Enter the quantity you want to add to stock",
            name: "QuantityToAdd",
            validate: (value) => {
                if (isNaN(value)) {
                    return false;
                } else {
                    return true;
                };
            },
        }
    ]).then(function (answer) {
        connection.query("SELECT * FROM products WHERE ?",
            {
                item_id: answer.ItemToAdd,
            }, function (err, res) {
                if (err) throw err;
                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: (res[0].stock_quantity + parseInt(answer.QuantityToAdd)),
                        },
                        {
                            item_id: answer.ItemToAdd,
                        }],
                    function (err, response) {
                        if (err) throw err;

                        console.log("\nInventory Updated " + response.affectedRows + " row affected\n");
                        nextOrExitPrompt();
                    },
                );
            });
    });
};

function addNewProduct() {
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the product name. ",
            name: "newProdName"
        },
        {
            type: "input",
            message: "Enter Department Name",
            name: "departmentName"
        },
        {
            type: "input",
            message: "Enter Unit Price. ",
            name: "price",
            validate: (value) => {
                if (isNaN(value)) {
                    return false;
                } else {
                    return true;
                };
            }
        },
        {
            type: "input",
            message: "Enter the stock quantity",
            name: "quantity",
            validate: (value) => {
                if (isNaN(value)) {
                    return false;
                } else {
                    return true;
                };
            }
        }
    ]).then(function (answers) {
        connection.query("INSERT INTO products SET ?",
            [
                {
                    product_name: answers.newProdName,
                    department_name: answers.departmentName,
                    price: answers.price,
                    stock_quantity: answers.quantity
                }
            ], function (err, res) {
                if (err) throw err;
                console.log("\nINSERTING NEW PRODUCT\n");
                console.log("New product inserted " + res.affectedRows + " row affected");
                nextOrExitPrompt();
            })
    })
}