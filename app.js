const {Client, Intents, MessageEmbed} = require("discord.js")
const {Player, RepeatMode} = require("discord-music-player")

const env = require("./env.json")


const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]
})
const settings = {
    prefix: '!', token: env.token
}

const player = new Player(client, {
    leaveOnEmpty: true, // ytdlRequestOptions: ['-f "bestaudio/best"']
})
client.player = player

client.on("ready", () => {
    console.log("ready")
})

client.login(settings.token).then(() => {
    console.log("logged in")
})

client.on('messageCreate', async (message) => {
    const args = message.content.slice(settings.prefix.length).trim().split(/ +/g)
    const command = args.shift()
    let queue = client.player.getQueue(message.guild.id)

    if (command === 'play' || command === 'p') {
        let queue = client.player.createQueue(message.guild.id)
        await queue.join(message.member.voice.channel)
        let song = await queue.play(args.join(' ')).catch(_ => {
            if (!queue) queue.stop()
        })
        const author = message.author;
        song.requestedBy = author
        const embed = new MessageEmbed()
            .setTitle(song.name)
            .setThumbnail(song.thumbnail)
            .setURL(song.url)
            .setColor(author.hexAccentColor)
            .setAuthor({
                name: 'Added to queue', iconURL: author.displayAvatarURL()
            })
            .addField('Duration', song.duration, true)
            .addField('Uploader', song.author, true)
            .addField('Requested by', author.toString(), true)
        message.channel.send({embeds: [embed]})
    }

    if (command === 'playlist') {
        let queue = client.player.createQueue(message.guild.id)
        await queue.join(message.member.voice.channel)
        let song = await queue.playlist(args.join(' ')).catch(_ => {
            if (!queue) queue.stop()
        })
    }

    if (command === 'skip' || command === 's') {
        queue.skip()
        message.channel.send("Skipped current song")
    }

    if (command === 'stop') {
        queue.stop()
    }

    if (command === 'removeLoop') {
        queue.setRepeatMode(RepeatMode.DISABLED)
    }

    if (command === 'toggleLoop') {
        queue.setRepeatMode(RepeatMode.SONG)
    }

    if (command === 'toggleQueueLoop') {
        queue.setRepeatMode(RepeatMode.QUEUE)
    }

    if (command === 'volume' || command === 'v') {
        queue.setVolume(parseInt(args[0]))
    }

    if (command === 'seek') {
        await queue.seek(parseInt(args[0]) * 1000)
    }

    if (command === 'clearQueue') {
        queue.clearQueue()
    }

    if (command === 'shuffle') {
        queue.shuffle()
    }

    if (command === 'getQueue') {
        console.log(queue)
    }

    if (command === 'q') {
        if (typeof queue.songs !== undefined && queue.songs.length > 0) {
            const firstSong = queue.songs[0];
            const embed = new MessageEmbed()
                .setTitle(`Now playing: ${firstSong.name}`)
                .setThumbnail(firstSong.thumbnail)
                .setURL(firstSong.url)
                .setColor(firstSong.requestedBy.hexAccentColor)
                .setAuthor({
                    name: 'Requested queue',
                    iconURL: message.author.displayAvatarURL()
                })
                .setDescription(queue.songs.length > 1 ? 'Next in queue:' : '')
            for (let i = 1; i < queue.songs.length; ++i) {
                const song = queue.songs[i]
                embed.description += `\n${i}. [${song.name}](${song.url}) requested by ${song.requestedBy.toString()}`
            }
            message.channel.send({embeds: [embed]})
        }
    }

    if (command === 'pause') {
        queue.setPaused(true)
        message.channel.send('Paused')
    }

    if (command === 'resume') {
        queue.setPaused(false)
        message.channel.send('Resumed')
    }

    if (command === 'remove' || command === 'r') {
        queue.remove(parseInt(args[0]))
    }
})
