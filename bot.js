const Discord = require("discord.js");
const axios = require('axios');
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
	client.user.setActivity(`${prefix}play`, { type: 2 });
});


client.on("messageCreate", async (message) => {
	let subscription = subscriptions.get(message.guildId);
	console.log(message.content);
	if (message.content === prefix + "source") { // Source link command
		console.log("source worked");
		message.reply("https://powerhitz.com/1Power");
	}
	else if (message.content === prefix + "join" || message.content === prefix + "play") { // Join voice channel command
		console.log("join worked");
		if (!subscription) {
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
	}
	else if (message.content === prefix + "leave" || message.content === prefix + "stop") { // Disconnect the player command
		console.log("stop worked");
		if (subscription) {
			if (message.member?.voice.channel == message.guild.me.voice.channel) {
				subscription.connection.destroy();
				subscriptions.delete(message.guildId);
				message.react("👋");
			} else {
				await message.reply("The bot is currently in another channel right now.");
			}
		}
	}
	else if (message.content === prefix + "current" || message.content ==="nowplaying") { // Current song command
		let getSong = async () => {
			let response = await axios.get("https://player.powerhitz.com/streamdata.php?h=ais-edge16-jbmedia-nyc04.cdnstream.com&p=7080&i=1power");
			let song = response.data;
			return song;
		}
		let songValue = await getSong();
		await message.reply(`Currently playing: ${songValue.song}`);
	}
	else if (message.content === prefix + "lastplayed") { // Last played 5 songs player
		let getSongList = async () => {
			let response = await axios.get("https://player.powerhitz.com/external.php?http://ais-edge16-jbmedia-nyc04.cdnstream.com:8443/ice_history.php?h=ais-edge16-jbmedia-nyc04.cdnstream.com&p=7080&i=1power");
			let songList = response.data;
			return songList;
		}
		let songListValue = await getSongList();
		let messageToReply = "";
		var i = 0;
		while (i < 5) {
			if (!songListValue[i].song.includes("***** POWERHITZ.COM - 1POWER *****")) {
				messageToReply += `${i + 1}. ${songListValue[i].song}\n`;
				++i;
			}
		}
		await message.reply(messageToReply);
	}
	else if (message.content[0] === prefix) { // Invalid command
		console.log("nothing worked");
		if (message.member?.voice.channel == message.guild.me.voice.channel) {
			message.reply("Invalid command.");
		} else {
			await message.reply("The bot is currently in another channel right now.");
		}
	}
});

client.login(process.env.TOKEN);