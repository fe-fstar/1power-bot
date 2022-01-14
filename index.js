const Discord = require("discord.js");

require("dotenv").config();

const client = new Discord.Client({
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MESSAGE_REACTIONS",
        "GUILD_VOICE_STATES"
    ]
});

const prefix = "1p.";

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});


client.on("messageCreate", (message) => {
    if(message.content == prefix + "source") {
        message.reply("https://powerhitz.com/1Power");
        message.react("👌");
    }
});


client.login(process.env.TOKEN);