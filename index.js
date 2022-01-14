const Discord = require("discord.js");

require("dotenv").config();

const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
} = require('@discordjs/voice');

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_VOICE_STATES"
    ]
});

const player = createAudioPlayer();

const resource = createAudioResource("https://live.powerhitz.com/1power?esPlayer.mp3");

const prefix = "1p.";

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});


client.on("messageCreate", async (message) => {
    if(message.content == prefix + "source") {
        message.reply("https://powerhitz.com/1Power");
    }

    if(message.content == prefix + "play") {
        const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
                player.play(resource);
                connection.subscribe(player);
				await message.reply("Playing now!");
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply("Join a voice channel then try again!");
		}
    }
});

client.login(process.env.TOKEN);