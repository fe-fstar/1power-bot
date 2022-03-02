const Discord = require("discord.js");
const axios = require('axios');
const { MessageEmbed } = require('discord.js');
require("dotenv").config();

var MusicSubscription = require("./subscription");
const isInvalidCommand = require("./utils");

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

const prefix = "1";

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}`);
	client.user.setActivity(`${prefix}play`, { type: "LISTENING" });
});

client.on("messageCreate", async (message) => {
	let messageIncoming = message.content.toLowerCase();
	let subscription = subscriptions.get(message.guildId);

	if (messageIncoming === prefix + "source") { // Source link command
		message.reply("https://powerhitz.com/1Power");
	}
	else if (messageIncoming === prefix + "join" || messageIncoming === prefix + "play") { // Join voice channel command
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
				subscription.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
					try {
						await Promise.race([
							entersState(subscription.connection, VoiceConnectionStatus.Signalling, 3_000),
							entersState(subscription.connection, VoiceConnectionStatus.Connecting, 3_000),
						]);
						// Seems to be reconnecting to a new channel - ignore disconnect
					} catch (error) {
						// Seems to be a real disconnect which SHOULDN'T be recovered from
						subscription.connection.destroy();
						subscriptions.delete(message.guildId);
					}
				});
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
	else if (messageIncoming === prefix + "leave" || messageIncoming === prefix + "stop") { // Disconnect the player command
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
	else if (messageIncoming === prefix + "current" || messageIncoming === prefix + "nowplaying"  || messageIncoming === prefix + "now") { // Current song command
		let getSong = async () => {
			let response = await axios.get("https://player.powerhitz.com/external.php?http://ais-edge16-jbmedia-nyc04.cdnstream.com:8443/ice_history.php?h=ais-edge16-jbmedia-nyc04.cdnstream.com&p=7080&i=1power");
			let songList = response.data;
			return songList[0];
		}
		let songValue = await getSong();
		let exampleEmbed = new MessageEmbed()
			.setColor("#ffd633")
			.setAuthor( {name: "▶️ Currently Playing:"} )
			.setTitle(!songValue.title.includes("POWERHITZ.COM") ? `${songValue.song}` : "Advertisements");

		message.reply({ embeds: [exampleEmbed] });
	}
	else if (messageIncoming === prefix + "lastplayed" || messageIncoming === prefix + "last") { // Last played 5 songs command
		let getSongList = async () => {
			let response = await axios.get("https://player.powerhitz.com/external.php?http://ais-edge16-jbmedia-nyc04.cdnstream.com:8443/ice_history.php?h=ais-edge16-jbmedia-nyc04.cdnstream.com&p=7080&i=1power");
			let songList = response.data;
			return songList;
		}
		let songListValue = await getSongList();
		let messageToReply = "";
		let i = 0;
		let j = 0;
		while (j < 5) {
			if (!songListValue[i].title.includes('POWERHITZ.COM')) {
				messageToReply += `${j + 1}. ${songListValue[i].song}\n`;
				++j;
			}
			++i;
		}

		let exampleEmbed = new MessageEmbed()
			.setColor("#ffd633")
			.setAuthor( {name: "▶️ Last Played 5 Tracks:"} )
			.setDescription(`\`${messageToReply}\``);

		message.reply({ embeds: [exampleEmbed] });
	}
	else if (messageIncoming === prefix + "help" || messageIncoming === prefix + "commands") { // Help command
		let exampleEmbed = new MessageEmbed()
			.setColor("#ffd633")
			.setTitle("About Power Hitz Bot:")
			.setDescription("Power Hitz | 1Power Bot, made by Kolta, is a radio player to stream powerhitz.com/1Power")
			.addFields(
				{ name: `\`${prefix}source\``, value: 'Tells you the link to Power Hitz | Hits & Hip Hop' },
				{ name: `\`${prefix}join\` (or \`${prefix}play\`)`, value: 'Starts playing the radio in the voice channel you are at.' },
				{ name: `\`${prefix}leave\` (or \`${prefix}stop\`)`, value: 'Stops the radio and disconnects from the channel.' },
				{ name: `\`${prefix}current\` (or \`${prefix}nowplaying\` or \`${prefix}now\`)`, value: 'Tells you which music is currently playing (mismatches may occur).' },
				{ name: `\`${prefix}lastplayed\` (or \`${prefix}last\`)`, value: 'Tells you the last 5 tracks played in the radio.' },
				{ name: `\`${prefix}help\``, value: 'Tells you the available commands.' }
			);

		message.reply({ embeds: [exampleEmbed] });
	}
	else if (isInvalidCommand(message.content, prefix)) { // Invalid command
		message.reply(`Invalid command. You can type \`${prefix}help\` to see available commands.`);
	}
});

client.login(process.env.TOKEN);