const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js');
// const {Sonny} = require('./testSonny')
const net = new brain.recurrent.LSTM()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BootSonny {
  constructor (learnedIntentsDir, intentFileDir) {
    this.learnedIntentsDir = learnedIntentsDir == undefined ? './learnedIntents/' : learnedIntentsDir
    this.intentFileDir = intentFileDir == undefined ? 'testeIntents.json' : intentFileDir

    /**
     * 
     * @param {String} learnedIntentsDir Recebe o diretório de onde se encontram as intents aprendidas por Sonny
     * @returns {Array<String>} Retorna todos os arquivos dentro do diretório de intents aprendidas
     */
    BootSonny.FindLocalFiles = (learnedIntentsDir) => {
      return fs.readdirSync(learnedIntentsDir)
    }

    BootSonny.prototype.StartBoot = () => {
      let filesInLearnedDir = BootSonny.FindLocalFiles(this.learnedIntentsDir)
      if (filesInLearnedDir.length > 0) {
        BootSonny.prototype.CheckContentFile(filesInLearnedDir)
      } else {
        throw new Error('Sonny ainda não aprendeu nenhuma intent, por favor execute o treinamento')
      }
    }

    BootSonny.prototype.CheckContentFile = (fileName) => {
      for (let i = 0; i < fileName.length; i++) {
        let fileBuffer = fs.readFileSync(this.learnedIntentsDir + fileName[i])
        if (fileBuffer.toString() === '') {
          // tratar de outra maneira
          // throw new Error('Sonny ainda não aprendeu nenhuma intent, por favor execute o treinamento')
        } else {
          // proximo passo, receber o input do usuário e comparar com os dados nas intents
          rl.question('Me: ', (q) => {
            let sonnyBooted = new BootSonny
            let tagIntentDetected = BootSonny.GetContentFile(q)
            fs.readFile(this.learnedIntentsDir + tagIntentDetected + '.json', (err, data) => {
              if (err) return console.log(err)
              net.fromJSON(JSON.parse(data.toString()))
              console.log(`Sonny: ${net.run(q)}`)
              sonnyBooted.boot()
            })
          })
        }
      }
    }

    BootSonny.GetContentFile = (question) => {
      let fileBuffer = fs.readFileSync(this.intentFileDir)
      let jsonFileContent = JSON.parse(fileBuffer.toString())
      for (let i = 0; i < jsonFileContent.intents.length; i++) {
        if (jsonFileContent.intents[i].input.indexOf(question) > -1) {
          return jsonFileContent.intents[i].tag
        }
      }
    }

    return {
      boot: () => {
        BootSonny.prototype.StartBoot()
      }
    }
  }
}

let bSonny = new BootSonny()
// let arrayIntents = ['greetings', 'cardapio_opcoes']

// let sonny = new Sonny(null, arrayIntents, 200)
// sonny.train()
bSonny.boot()
