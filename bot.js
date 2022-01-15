const Discord = require("discord.js");

require("dotenv").config();

var MusicSubscription = require("./subscription");

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

const subscriptions = new Map();

const prefix = "+";

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity(`${prefix}join`, {type: 2});
});


client.on("messageCreate", async (message) => {
	let subscription = subscriptions.get(message.guildId);
    if(message.content == prefix + "source") {
        message.reply("https://powerhitz.com/1Power");
    } else if(message.content == prefix + "join" || message.content == prefix + "j") {
		if(!subscription) {
			const channel = message.member?.voice.channel;
			if (channel) {
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator
					}), "https://live.powerhitz.com/1power?esPlayer.mp3"
				);
				subscription.connection.on("error", console.warn);
				subscriptions.set(message.guildId, subscription);
				try {
					await message.reply("Playing now!");
					message.react("🔴");
				} catch (error) {
					console.error(error);
				}
			} else {
				await message.reply("Join a voice channel then try again!");
			}
		} else {
			await message.reply("The bot is already in a channel.");
		}
    } else if(message.content == prefix + "pause" || message.content == prefix + "stop") {
        if(subscription) {
			if(message.member?.voice.channel === message.guild.me.voice.channel) {
				subscription.stop();
				message.react("⏹️");
			} else {
				await message.reply("The bot is currently in another channel right now.");
			}
		} else {
			message.reply(`Not playing in this server. Try ${prefix}join to start playing first.`);
		}
    } else if(message.content == prefix + "resume" || message.content == prefix + "play") {
        if(subscription) {
			if(message.member?.voice.channel == message.guild.me.voice.channel) {
				subscription.refreshResource();
				subscription.play();
				message.react("▶️");
			} else {
				await message.reply("The bot is currently in another channel right now.");
			}
		} else {
			message.reply(`Not playing in this server. Try ${prefix}join to start playing first.`);
		}
    } else if(message.content == prefix + "leave") {
        if(subscription) {
			if(message.member?.voice.channel === message.guild.me.voice.channel) {
				subscription.connection.destroy();
				subscriptions.delete(message.guildId);
				message.react("👋");
			} else {
				await message.reply("The bot is currently in another channel right now.");
			}
		}
    } else if (message.content[0] == "+"){
		message.reply("Invalid command.");
	}
});

client.login(process.env.TOKEN);