const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js')
const net = new brain.recurrent.LSTM()

let array = []

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

fs.readFile('learned.json', (err, data) => {
  if (err) return console.log(err)

  if (data.toString() === '') {
    console.log('A Network já foi treinada')
    train();
  } else {
    net.fromJSON(JSON.parse(data.toString()))
    boot();
  }
})

const train = () => {
  console.log('treinando sonny...')
  fs.readFile('intentes.txt', (err, data) => {
    array = data.toString().split('.')
    console.log(array)
    net.train(array, {
      iterations: 200,
      log: true,
      errorThresh: 0.01
    });
    fs.writeFileSync('learned.json', JSON.stringify(net.toJSON()), (err, result) => {
      if (err) return console.log(err)
      console.log(result)
    })
    console.log('Treinamento finalizado')
  })
}

const boot = () => {
  rl.question('Enter: ', (q) => {
    console.log(net.run(q))
    boot();
  })
}