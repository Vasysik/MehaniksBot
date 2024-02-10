const mineflayer = require('mineflayer')
const mineflayerViewer = require('prismarine-viewer').mineflayer

const autoeat = require('mineflayer-auto-eat').plugin
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalBlock } = require('mineflayer-pathfinder').goals

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const options = {
    host: 'm.vasys.ru', // Change this to the ip you want.
    port: 25565, // Change this to the port you want.
    username: 'Herobrine',
    version: '1.18.1'
}

const bot = mineflayer.createBot(options)
bot.loadPlugin(pathfinder)
bot.loadPlugin(autoeat)

rl.on('line', (input) => {bot.chat(input)});

bot.on('messagestr', async (message, messagePosition, jsonMsg, sender, verified) => {console.log('> ' + sender + ' ' + message)})

bot.once('spawn', () => {
  bot.chat('')
  bot.chat('')
  mineflayerViewer(bot, { port: 3007 })

  bot.on('path_update', (r) => {
    const nodesPerTick = (r.visitedNodes * 50 / r.time).toFixed(2)
    console.log(`I can get there in ${r.path.length} moves. Computation took ${r.time.toFixed(2)} ms (${nodesPerTick} nodes/tick). ${r.status}`)
    const path = [bot.entity.position.offset(0, 0.5, 0)]
    for (const node of r.path) {
      path.push({ x: node.x, y: node.y + 0.5, z: node.z })
    }
    bot.viewer.drawLine('path', path, 0xff00ff)
  })

  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)

  bot.viewer.on('blockClicked', (block, face, button) => {
    if (button !== 2) return // only right click

    const p = block.position.offset(0, 1, 0)

    bot.pathfinder.setMovements(defaultMove)
    bot.pathfinder.setGoal(new GoalBlock(p.x, p.y, p.z))
  })
})