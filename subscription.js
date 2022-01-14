const {
	AudioPlayer,
	AudioPlayerStatus,
	AudioResource,
	createAudioPlayer,
	entersState,
	VoiceConnection,
	VoiceConnectionDisconnectReason,
	VoiceConnectionStatus,
	createAudioResource
} = require('@discordjs/voice');

class MusicSubscription {
	constructor(connection) {
		this.resource = createAudioResource("https://live.powerhitz.com/1power?esPlayer.mp3");;
		try {
			entersState(connection, VoiceConnectionStatus.Ready, 5_000);
		} catch (error) {
			connection.destroy();
			throw error;
		}

		this.connection = connection;
		this.audioPlayer = createAudioPlayer();
		this.audioPlayer.play(this.resource);
		connection.subscribe(this.audioPlayer);
	}

	stop() {
		this.audioPlayer.stop(true);
	}
}

module.exports = MusicSubscription;