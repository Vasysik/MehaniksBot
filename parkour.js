const mineflayer = require('mineflayer')
//const mineflayerViewer = require('prismarine-viewer').mineflayer
//const mineflayerViewer = require('prismarine-viewer').headless
const pathfinder = require('mineflayer-pathfinder').pathfinder
const Movements = require('mineflayer-pathfinder').Movements
const { GoalNear } = require('mineflayer-pathfinder').goals
//const autoeat = require('mineflayer-auto-eat').plugin
var Vec3 = require('vec3').Vec3

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let bot
oldP = []
p = []
dayRecord = 0
point = 0
onServer = false

reload({host: 'm.vasys.ru', port: 25565, username: 'opapap', version: '1.20.1'})

function reload(options) {
    onServer = false
    setTimeout(() => {
        bot = mineflayer.createBot(options)
        //bot.loadPlugin(autoeat)
        bot.loadPlugin(pathfinder)
        const defaultMove = new Movements(bot)
        defaultMove.allowFreeMotion = true
        defaultMove.canOpenDoors = true
    
        bot.once('spawn', () => {
            bot.chat('')
            bot.chat('')
            setTimeout(parkour, 1000)
            //mineflayerViewer(bot, { firstPerson: true, port: 3007 })
            //mineflayerViewer(bot, { output: '127.0.0.1:8089', frames: -1, width: 512, height: 512 })
            bot.pathfinder.setMovements(defaultMove)
            onServer = true
        })
        
        bot.on('messagestr', async (message, messagePosition, jsonMsg, sender, verified) => {
            console.log('> ' + sender + ' ' + message)
            if(message.split(' ').length == 6 && message.split(' ')[0] == 'You' && parseInt(message.split(' ')[5]) > dayRecord) {
                dayRecord = message.split(' ')[5]
                bot.chat('Рекорд сессии: ' + dayRecord)
            }
            if(message.split(' ').length == 2 && message.split(' ')[0] == 'Score') point = message.split(' ')[1]
        })
    
        // bot.on('path_update', (r) => {
        //     const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
        //     console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`)
        //     const path = [bot.entity.position.offset(0, 0.5, 0)]
        //     for (const node of r.path) {
        //         path.push({ x: node.x, y: node.y + 0.5, z: node.z })
        //     }
        //     bot.viewer.drawLine('path', path, 0xff00ff)
        // })
    
        rl.on('line', (input) => {
            if(input == '!oldP') console.log('oldP:', oldP)
            else if (input == '!p') console.log('p:', p)
            else if (input == '!point') console.log('point:', point)
            else if (input == '!dayRecord') console.log('dayRecord:', dayRecord)
            else if (input == '!reload') bot.quit()
            else bot.chat(input)
        })
    
        bot.on('end', () => {reload(options)})
    }, 5000)
}

function parkour () {
    try {
        if (bot.entity.position.y <= 16) {
        p = []
        bot.pathfinder.setGoal(null)
        bot.chat('/ajp start p2')
        } else {
            try {
                for (let x = bot.entity.position.x-4; x <= bot.entity.position.x+4; x++) {
                    for (let y = bot.entity.position.y-1; y <= bot.entity.position.y+1; y++) {
                        for (let z = bot.entity.position.z-4; z <= bot.entity.position.z+4; z++) {
                            if (bot.blockAt(new Vec3(x, y-1, z)).type != 0 && bot.entity.position.distanceTo(new Vec3(Math.ceil(x)-0.5, Math.ceil(y), Math.ceil(z)-0.5)) >= 1.5 && !p.includes(String(Math.ceil(x)-0.5) +' '+ String(Math.ceil(y)) +' '+ String(Math.ceil(z)-0.5))) {
                                crds = String(Math.ceil(x)-0.5) +' '+ String(Math.ceil(y)) +' '+ String(Math.ceil(z)-0.5)
                                p.push(crds)
                                if (oldP.length >= 10) oldP.shift()
                                oldP.push(crds)
                                //console.log(p, bot.entity.position)
                            }
                        }
                    }
                }
            } catch (err) { console.log(err) }
        }
        if (p.length > 0) {
            var locate = String(p[0]).split(' ')
            console.log('Шаг:', locate, bot.entity.position.distanceTo(new Vec3(locate[0], locate[1], locate[2])))
            if(bot.entity.position.distanceTo(new Vec3(locate[0], locate[1], locate[2])) > 1.5) {
                if (oldP.length >= 5 && oldP[0] == p[0] && oldP[4] == p[0]) {
                    bot.quit()
                    return
                }
                else bot.pathfinder.setGoal(new GoalNear(locate[0], locate[1], locate[2], 0.3), true)
            }
            p.shift()
        }
    } catch { return }
    if(onServer) setTimeout(parkour, 2000)
}