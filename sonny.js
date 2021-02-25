const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js')
const net = new brain.recurrent.LSTM()

let array

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
  fs.readFile('intents.json', (err, data) => {
    array = data.toString()
    let jsonFile = JSON.parse(array)
    let inOuts = []
    jsonFile.intents.forEach(element => {
      if (element.tag == 'greeting') {
        for (let i = 0; i < element.input.length; i++) {
          inOuts.push({
            input: element.input[i],
            output: element.output[i]
          })
        }
      }
    });
    console.log(inOuts)    
    net.train(inOuts);
    fs.writeFileSync('learned.json', JSON.stringify(net.toJSON()), (err, result) => {
      if (err) return console.log(err)
    })
    console.log('Treinamento finalizado')
  })
}

const boot = () => {
  rl.question('Me: ', (q) => {
    console.log(`Sonny: ${net.run(q)}`)
    boot();
  })
}