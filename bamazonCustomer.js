const { prompt } = require('inquirer')
const { createConnection } = require('mysql2')

const db = createConnection({
  host: 'localhost',
  user: 'root',
  port: 3306,
  password: 'password',
  database: 'bamazon'
})
// ----WORKING-ish-----

// async function listItems () {
//   let response = await new Promise((resolve, reject) => {
//     if (error) {
//       reject(error)
//     } else {
//       resolve(
//         db.query('SELECT * FROM products', (error, data) => {
//           if (error) { console.log(error) }
//           data.forEach(({ item_id, product_name, department_name, price, stock_quantity }) => console.log(`
//     Item ID: ${item_id}
//     Product: ${product_name}
//     Price: $${price}
//     `))
//         })
//       )
//     }
//   })
//   return response
// }
// const listItems = _ => {
//   db.connect(error => {
//     if (error) { console.log(error) }
//     db.query('SELECT * FROM products', (error, data) => {
//       if (error) { console.log(error) }
//       data.forEach(({ item_id, product_name, department_name, price, stock_quantity }) => console.log(`
//     Item ID: ${item_id}
//     Product: ${product_name}
//     Price: $${price}
//     `))
//     })
//   })
//   return response
// }

async function getInventory (ID) {
  let response = await new Promise((resolve, reject) => {
    db.query(`SELECT * FROM products WHERE item_id = ${ID}`, (error, response) => {
      if (error) {
        reject(error)
      } else {
        resolve(response)
      }
    })
  })
  return response
}

const purchase = (ID, quantity) => {
  prompt([
    {
      type: 'list',
      name: 'purchase',
      message: 'Please confirm the purchase',
      choices: ['Confirm', 'Cancel']
    }
  ])
    .then(response => {
      if (response.purchase !== 'Confirm') {
        console.log('Thank you for shopping with us!')
      } else {
        // console.log(ID)
        // console.log(quantity)
        getInventory(ID)
          .then(res => {
            let calc = res[0].stock_quantity - quantity
            db.query(`UPDATE products SET stock_quantity = ${calc} WHERE item_id = ${ID}`)
            console.log('Purchase Complete')
          })
      }
    })
    .catch(error => console.log(error))
}

const getAction = _ => {
//   listItems()
  prompt([
    {
      type: 'list',
      name: 'ID',
      message: 'What is the ID of the item you would like to purchase?',
      choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    },
    {
      type: 'input',
      name: 'quantity',
      message: 'How many of those items would you like to buy?'
    }
  ])
    .then(({ ID, quantity }) => {
      getInventory(ID)
        .then(response => {
          if (response[0].stock_quantity <= 0) {
            console.log('We have sold out of that item')
          } else {
            let cost = response[0].price * quantity
            console.log(`There are currently ${response[0].stock_quantity} ${response[0].product_name} left. Purchasing ${quantity} at $${response[0].price} would total $${cost}`)
          }
        }).then(response => {
          purchase(ID, quantity)
        })
        .catch(error => console.log(error))
    })
    .catch(error => console.log(error))
}

db.connect(error => error ? console.log(error) : getAction())
