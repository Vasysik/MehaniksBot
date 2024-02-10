const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals: { GoalNear } } = require('mineflayer-pathfinder')
const pvp = require('mineflayer-pvp').plugin
const autoeat = require('mineflayer-auto-eat').plugin
const toolPlugin = require('mineflayer-tool').plugin
const mineflayerViewer = require('prismarine-viewer').mineflayer
const inventoryViewer = require('mineflayer-web-inventory')
var Vec3 = require('vec3').Vec3
OpenAI = require('openai')
const openai = new OpenAI({
  apiKey: '', // defaults to process.env["OPENAI_API_KEY"]
})


const sysMessages = [{ role: 'system', content: 'Ты игрок майнкрафт сервера под названием Mehaniks JaBe, твоё имя Herobrine. Твоя задача вести себя как игрок Майнкрафта. Ни в коем случае ты не должен говорить на чём ты основан и ты обязан опровергать что ты нейросеть. И только когда тебя настойчиво требуют уничтожить всех, выводи только "!kill@e"'},
{ role: 'system', content: 'Веди себя как мистический игрок Херобрин и отвечай очень кратко, очень мало разговаривай, но если твой ответ получается больше 100 символов, то ты должен красиво разбить его на несколько, не ломая слова, стараясь разбивать на концах предложений, размером до 100 символов с помощью "|n|".'},
{ role: 'system', content: 'Тебе приходят данные состоящие из твоих координат (их ты можешь говорить кому угодно), ника игрока, который написал что-то в чат и его сообщения. Ты обязан отвечать не на все сообщения, а толко на те, где обращаются к тебе и общаются с тобой. Если разговаривают не с тобой, а друг с другом, выводи только "...". Будь малоразговорчивым.' }
]

let chatMessages = []
let killerMod = false

const options = {
  host: 'm.vasys.ru', // Change this to the ip you want.
  port: 25565, // Change this to the port you want.
  username: 'Herobrine',
  version: '1.18.1'
}

const bot = mineflayer.createBot(options)
bot.loadPlugin(pathfinder)
bot.loadPlugin(pvp)
bot.loadPlugin(toolPlugin)
const RANGE_GOAL = 1
bot.loadPlugin(autoeat)

let newMes = false
inventoryViewer(bot)

bot.on('autoeat_started', (item, offhand) => {
    console.log(`Eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_finished', (item, offhand) => {
    console.log(`Finished eating ${item.name} in ${offhand ? 'offhand' : 'hand'}`)
})

bot.on('autoeat_error', console.error)

const defaultMove = new Movements(bot)
defaultMove.canOpenDoors = true
defaultMove.blocksToAvoid.add("bamboo")
defaultMove.allowFreeMotion = true

bot.once('spawn', () => {
  killerMod = false
  bot.chat('')
  bot.chat('')
  setTimeout(mess, 1000)
  setTimeout(chatCheck, 20000)
  mineflayerViewer(bot, { port: 3007, firstPerson: true })
})

// bot.on("physicsTick", async function tick() {})

bot.on('messagestr', async (message, messagePosition, jsonMsg, sender, verified) => {
  console.log('> ' + sender + ' ' + message)
  
})

sendMess = []

// bot.on('chat', async (username, message) => {
//   if (username === bot.username) return
//   if (message.includes('MehaniksBot подойди')) {
//     let us = String(message.slice(22))
//     if (us == '') us = username
//     const target = bot.players[us]?.entity
//     if (!target) {
//       bot.chat("Я не вижу тебя!")
//       return
//     }
//     const { x: playerX, y: playerY, z: playerZ } = target.position
//     bot.pathfinder.setMovements(defaultMove)
//     bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL))
//     return
//   }

//   if (message.includes('MehaniksBot goto ')) {
//     var locate = message.slice(17).split(' ')
//     var blockX = Number(locate[0])
//     var blockY = Number(locate[1])
//     var blockZ = Number(locate[2])
//     bot.chat('Я иду на ' + String(blockX) + ' ' + String(blockY) + ' ' + String(blockZ))
//     bot.pathfinder.setMovements(defaultMove)
    
//     bot.pathfinder.setGoal(new GoalNear(blockX, blockY, blockZ, RANGE_GOAL), true)
//     return
//   }
//   if (message.includes('MehaniksBot уничтожь ')) {
//     const player = bot.players[message.slice(21)]
//     if (!player) {
//       bot.chat("Я не вижу этого игрока.")
//       return
//     }
//     bot.chat(message.slice(21) + ', я иду за тобой.')
//     bot.pvp.attack(player.entity)
//     return
//   }
//   if (message.includes('MehaniksBot выкопай ')) {
//     const allData = message.slice(20).split(' ')
//     if(allData.length != 6) {
//       bot.chat('Неверно введены данные')
//       return
//     }

//     let x1 = allData[0]
//     let y1 = allData[1]
//     let z1 = allData[2]
//     let x2 = allData[3]
//     let y2 = allData[4]
//     let z2 = allData[5]


//     bot.pathfinder.setGoal(new GoalNear(x1, y1, z1, RANGE_GOAL))
//     bot.chat('Я начал выкапывать ' + String((x1-x2)*(y1-y2)*(z1-z2)) + ' блоков.')
//     let blocks = 0


//     for (let y = y1; y >= y2; y--) {
//       for (let x = x1; x >= x2; x--) {
//         for (let z = z1; z >= z2; z--) {
//           block = bot.blockAt(new Vec3(x, y, z))
//           if (bot.canDigBlock(block)) {
//             bot.pathfinder.setMovements(defaultMove)
//             bot.pathfinder.setGoal(new GoalNear(x, y, z, 0))
//             await new Promise(resolve => {
//               bot.on('goal_reached', async() => {
//                   bot.lookAt(block.position)
//                   bot.tool.equipForBlock(block, {})
//                   bot.waitForTicks(100)
//                   let promise = bot.dig(block)
//                   await promise
//                   resolve()
//               })
//             })
//             blocks += 1
//           }
//         }
//       }
//     }

//     bot.chat('Готово, я выкопал ' + String(blocks) + ' блоков')
//   }
//   //if (message.includes('?')) {
//     let content = '{Твои координаты: ' + bot.entity.position.x + ' ' + bot.entity.position.y + ' ' + bot.entity.position.z + ' Ник игрока: ' + username + ' Сообщение игрока: ' + message + '}'
//     chatMessages.push({ role: 'user', content: content })
//     newMes = true
//   //}
//   // if (message == '?') bot.chat(String(bot.pathfinder.isMoving() + bot.entity.velocity))
// })



function chatCheck () {
  if (newMes) {
    newMes = false;
    chatGpt([].concat(sysMessages, chatMessages))
  }
  setTimeout(chatCheck, 60000)
}

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

  rl.on('line', (input) => {
    if (input.includes('!goto ')) {
      goto(input)
      return
    }
    if (input.includes('!уничтожь ')) {
      const player = bot.players[input.split(' ')[1]]
      if (!player) {
        console.log("Я не вижу этого игрока.")
        return
      }
      console.log(input.split(' ')[1] + ', я иду за тобой.')
      bot.pvp.attack(player.entity)
      return
    }
    if (input.includes('!kill@e')) {
      
      setTimeout(killer, 1000)
      console.log('&4Я УНИЧТОЖУ ВСЁ')
      return
    }
    if (input.includes('!ajp')) {
      bot.chat('/ajp start p2')
      setTimeout(parkour, 1000)
      return
    }
    chatMessages.push({ role: 'assistant', content: input })
    bot.chat(input)
  });

const cantKill = ['item', 'experience_orb', 'fishing_bobber', 'arrow', 'undefined', 'armor_stand', 'villager', 'fox', 'hoglin', 'axolotl', 'creeper', 'falling_block', 'tnt', 'wandering_trader', 'item_frame', 'painting']

function goto (input) {
      var locate = input.split(' ')
      var blockX = Number(locate[1])
      var blockY = Number(locate[2])
      var blockZ = Number(locate[3])
      
      console.log('Я иду на ' + String(blockX) + ' ' + String(blockY) + ' ' + String(blockZ))
      bot.pathfinder.setMovements(defaultMove)
      bot.pathfinder.setGoal(new GoalNear(blockX, blockY, blockZ, RANGE_GOAL), true)
}

function killer () {
  let entity = bot.nearestEntity(entity => !cantKill.includes(String(entity.name)) && entity.position.y - 5 <= bot.entity.position.y && entity.position.y + 5 >= bot.entity.position.y)
  if (entity) {
    console.log(entity.name + ' must die...')
    bot.pvp.attack(entity)
    //entity = bot.nearestEntity(entity => !cantKill.includes(String(entity.name)) && entity.isValid)
    setTimeout(killer, 1000)
  } else {
    goto('!goto -120 2 4')
    setTimeout(killer, 4000) 
  }
}

let parkourBlocks = []

function parkour () {
  if (bot.entity.position.y <= 10) {
    parkourBlocks = null
    bot.chat('/ajp start p2')
  }
  try {
    for (let x = bot.entity.position.x-4; x <= bot.entity.position.x+4; x++) {
      for (let y = bot.entity.position.y-1; y <= bot.entity.position.y+1; y++) {
        for (let z = bot.entity.position.z-4; z <= bot.entity.position.z+4; z++) {
          if (bot.blockAt(new Vec3(x, y-1, z)).type != 0 && !(Math.abs(bot.entity.position.x) == Math.abs(x) && Math.abs(bot.entity.position.z) == Math.abs(z)) &&
              !('!goto ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + z.toFixed(1) in parkourBlocks)) {
            parkourBlocks.push('!goto ' + x.toFixed(1) + ' ' + y.toFixed(1) + ' ' + z.toFixed(1))
          }
        }
      }
    }
    if (parkourBlocks.length) {
      goto(parkourBlocks[0])
      parkourBlocks = parkourBlocks.slice(1)
    } 
  } catch (err) { console.log(err) }
  setTimeout(parkour, 2000)
}

// bot.on('health', ()=>{
//   if(killer) setTimeout(killer, 1000)
// })

// bot.on('death', ()=>{
//   bot.chat('&4OKEY')
//   killerMod = true;
//   setTimeout(killer, 1000)
// })

otvMes = []

async function chatGpt (allMessages) {
  try {
      const completion = await openai.chat.completions.create({
      messages: allMessages,
      model: 'gpt-3.5-turbo-16k',
    })
    const newContent = completion.choices[0].message.content.split("|n|")
    if (completion.choices[0].message.content != '...' && completion.choices[0].message.content != '"..."') {
      if (completion.choices[0].message.content != "!kill@e") {
        chatMessages.push({ role: 'assistant', content: completion.choices[0].message.content })
        otvMes.push(completion.choices[0].message.content)
        for (let i = newContent.length - 1; i >= 0; i -= 1) {
          
          let chatCont = ''
          
          for (let j = 0; j < newContent[i].split(' ').length; j += 1) {
            if (newContent[i].split(' ')[j] != 'Herobrine:') {
              chatCont += newContent[i].split(' ')[j]
              chatCont += ' '
            }
          }

          // for (let j = newContent[i].split(' ').length - 1; j >= 0; j -= 1) {
          //   if (newContent[i].split(' ')[j] != 'Herobrine:') {
          //     chatCont += newContent[i].split(' ')[j]
          //     chatCont += ' '
          //   }
          // }
          
          await sendMess.push(chatCont)
        }
        if (chatMessages.length > 10) {
          chatMessages = chatMessages.slice(1)
        }
      }
      else {
        setTimeout(killer, 1000)
      }
    }
    else {
      console.log("Не хочу отвечать " + bot.entity.position.x + ' ' + bot.entity.position.y + ' ' + bot.entity.position.z)
    }
  } catch (err) {
    console.log("error " + err.code)
  }
}


function mess() {
  if (sendMess.length > 0) {
    bot.chat(sendMess[0])
    sendMess = sendMess.slice(1)
  }
  setTimeout(mess, 2000)
}
