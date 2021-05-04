const fs = require('fs')
const readline = require('readline')
const brain = require('brain.js');
const os = require("os");
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
            if (tagIntentDetected != 'no-intent') {
              fs.readFile(this.learnedIntentsDir + tagIntentDetected + '.json', (err, data) => {
                if (err) return console.log(err)
                net.fromJSON(JSON.parse(data.toString()))
                console.log("\x1b[36m", `Sonny: ${net.run(q)}`)
                sonnyBooted.boot()
              })
            } else {
              console.log(`Sonny: Desculpe, não entendi o que quis dizer, mas salvei sua intenção de pergunta para me atualizar`)
              sonnyBooted.boot()
            }
          })
        }
      }
    }

    /**
     * Função detecta qual arquivo de intents a resposta será direcionada, caso não encontre adiciona
     * a pergunta ao txt intentsSugestion para posteriormente ser treinado com novas intents
     * @param {string} question Parâmetro recebe o input do usuário e pesquisa para qual assunto aprendido para Sonny
     * deve direcionar
     * @returns {string}
     */
    BootSonny.GetContentFile = (question) => {
      let noIntent
      let normalizeString = []
      let fileBuffer = fs.readFileSync(this.intentFileDir)
      let jsonFileContent = JSON.parse(fileBuffer.toString())
      for (let i = 0; i < jsonFileContent.intents.length; i++) {
        jsonFileContent.intents[i].input.forEach(element => {
          normalizeString.push(element.normalize('NFD').replace(/[\u0300-\u036f]/g, ""))
        });
        if (jsonFileContent.intents[i].input.indexOf(question) > -1) {
          return jsonFileContent.intents[i].tag
        } else {
          if (i == jsonFileContent.intents.length - 1) {
            fs.open('intentsSugestion.txt', 'a', (e, id) => {
              fs.write(id, question + os.EOL, null, 'utf8', () => [
                fs.close(id, () => {
                  noIntent = true
                })
              ])
            })
            return 'no-intent'
          }
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
// generateKaywords()
function generateKaywords() {
  let words = ''
  let kWords = ''
  let intentTags = []
  fs.readFile('testeIntents.json', (err, data) => {
    let jsonFile = JSON.parse(data.toString())
    for (let i = 0; i < jsonFile.intents.length; i++) {
      console.log(jsonFile.intents[i].tag)
      for (let j = 0; j < jsonFile.intents[i].input.length; j++) {
        kWords += spliter(jsonFile.intents[i].input[j].split(' ')) == undefined ? '' : 
        spliter(jsonFile.intents[i].input[j].split(' '))
      }
      words += `${jsonFile.intents[i].tag}&${kWords}\n`
    }
    console.log(words)
  })
}

function spliter(word) {
  for (let i = 0; i < word.length; i++) {
    if (word[i].length >= 3) {
      console.log(word[i], 'palavra')
      return word[i]
    } else {
      return
    }
  }
}
