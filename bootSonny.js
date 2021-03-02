const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js');
const {Sonny} = require('./testSonny')
const net = new brain.recurrent.LSTM()

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BootSonny {
  constructor (learnedIntentsDir) {
    this.learnedIntentsDir = learnedIntentsDir == undefined ? './learnedIntents/' : learnedIntentsDir

    /**
     * 
     * @param {String} intentsDir Recebe o diretório de onde se encontram as intents aprendidas por Sonny
     * @returns {Array<String>} Retorna todos os arquivos dentro do diretório de intents aprendidas
     */
    BootSonny.FindLocalFiles = (learnedIntentsDir) => {
      return fs.readdirSync(learnedIntentsDir)
    }

    BootSonny.prototype.StartBoot = () => {
      console.log('Booting')
      let filesInLearnedDir = BootSonny.FindLocalFiles(this.learnedIntentsDir)
      if (filesInLearnedDir.length > 0) {
        BootSonny.prototype.CheckContentFile(filesInLearnedDir)
      } else {
        throw new Error('Sonny ainda não aprendeu nenhuma intent, por favor execute o treinamento')
      }
    }

    BootSonny.prototype.CheckContentFile = (fileName) => {
      console.log(fileName)
      for (let i = 0; i < fileName.length; i++) {
        let fileBuffer = fs.readFileSync(this.learnedIntentsDir + fileName[i])
        if (fileBuffer.toString() === '') {
          throw new Error('Sonny ainda não aprendeu nenhuma intent, por favor execute o treinamento')
        } else {
          // proximo passo, receber o input do usuário e comparar com os dados nas intents
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
