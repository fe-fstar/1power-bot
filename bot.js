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

const prefix = "1p.";

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity("Kolta", {type: 2});
});


client.on("messageCreate", async (message) => {
	let subscription = subscriptions.get(message.guildId);
    if(message.content == prefix + "source") {
        message.reply("https://powerhitz.com/1Power");
    }

    if(message.content == prefix + "play") {
		if(!subscription) {
			const channel = message.member?.voice.channel;
			if (channel) {
				subscription = new MusicSubscription(
					joinVoiceChannel({
						channelId: channel.id,
						guildId: channel.guild.id,
						adapterCreator: channel.guild.voiceAdapterCreator
					})
				);
				subscription.connection.on("error", console.warn);
				subscriptions.set(message.guildId, subscription);
				try {
					await message.reply("Playing now!");
				} catch (error) {
					console.error(error);
				}
			} else {
				await message.reply("Join a voice channel then try again!");
			}
		}
    }
    
    if(message.content == prefix + "resume") {
        if(subscription) {
			subscription.audioPlayer.unpause();
		} else {
			message.reply("Not playing in this server.");
		}
    }

    if(message.content == prefix + "pause") {
        if(subscription) {
			subscription.audioPlayer.pause();
		} else {
			message.reply("Not playing in this server.");
		}
    }

    if(message.content == prefix + "leave") {
        if(subscription) {
			subscription.connection.destroy();
			subscriptions.delete(message.guildId);
		} else {
			message.reply("Not playing in this server.");
		}
    }
});

client.login(process.env.TOKEN);