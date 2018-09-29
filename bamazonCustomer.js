const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');

const connection = mysql.createConnection({

    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'bamazon'

});

connection.connect((err) => {
    if (err) throw err;
    start();
});

const start = () => {
    connection.query("SELECT * FROM products", (err, results) => {
        if (err) throw err;
        console.table(results);

        inquirer
            .prompt([
                {
                    name: 'productID',
                    type: 'input',
                    message: 'What is the ID of the item you would like to purchase?'

                },
                {
                    name: 'quantity',
                    type: 'input',
                    message: 'How many units of this item would you like to purchase'
                }
            ]).then((answer) => {
                let id = parseInt(answer.productID) - 1;
                let quantity = parseInt(answer.quantity);
                connection.query(
                    "SELECT * FROM products",
                    (err, res) => {
                        if (err) throw err;
                        if (quantity < res[id].stock_quantity) {
                            let newQuantity = res[id].stock_quantity - quantity;
                            let cost = quantity * res[id].price;
                            connection.query(
                                "UPDATE products SET ? WHERE ?",
                                [
                                    {
                                        stock_quantity: newQuantity
                                    },
                                    {
                                        item_id: answer.productID
                                    },
                                ],
                                (err) => {
                                    if (err) throw err;
                                    console.log(`\n\nYour total cost is $${cost}. Enjoy your ${res[id].product_name}. Please buy more things!\n\n\n`);
                                    start()
                                }
                            );
                        }else {
                            console.log("\n\nI'm sorry we don't have enough of that item. Try again?\n\n");
                            start()
                        }
                    }
                );
            });

    })
};