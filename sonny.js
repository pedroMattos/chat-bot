const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js')
const net = new brain.recurrent.LSTM()

let array
// teste de performance/tempo de aprendizado
let initTime = Date.now();
// configuração readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// verifica se o json de treinamento está preenchido
fs.readFile('learned.json', (err, data) => {
  if (err) return console.log(err)

  if (data.toString() === '') {
    console.log('Sonny será treinado agora!')
    train();
  } else {
    net.fromJSON(JSON.parse(data.toString()))
    boot();
  }
})

// realiza o treinamento
const train = () => {
  console.log('treinando sonny...')
  fs.readFile('intents.json', (err, data) => {
    array = data.toString()
    let jsonFile = JSON.parse(array)
    let inOuts = []
    jsonFile.intents.forEach(element => {
      // tempo de treino 2 horas ou mais
      if (element.tag == 'saudacoes' || element.tag == 'cardapio_opcoes' || element.tag == 'cardapio_escolhas') {
        for (let i = 0; i < element.input.length; i++) {
          inOuts.push({
            input: element.input[i],
            output: element.output[i]
          })
        }
      }
    });
    // console.log(inOuts)    
    net.train(inOuts, {
      log: true,
    });
    fs.writeFileSync('learned.json', JSON.stringify(net.toJSON()), (err, result) => {
      if (err) return console.log(err)
    })
    console.log('Treinamento finalizado')
    console.log("Sonny foi treinado com 20000 iterações em: ", Date.now() - initTime, ' milisegundos')
    boot();
  })
}

// inicia o bot caso já tenha sido treinado
const boot = () => {
  rl.question('Me: ', (q) => {
    console.log(`Sonny: ${net.run(q)}`)
    boot();
  })
}