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
	constructor(connection, resource) {
		this.resource = createAudioResource(resource);
		try {
			entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		} catch (error) {
			connection.destroy();
			throw error;
		}

		this.connection = connection;
		this.audioPlayer = createAudioPlayer();
		this.audioPlayer.play(this.resource);
		connection.subscribe(this.audioPlayer);
	}

	play() {
		this.audioPlayer.play(this.resource);
	}

	stop() {
		this.audioPlayer.stop(true);
	}

	refreshResource() {
		this.resource = createAudioResource(this.resource);
	}
}

module.exports = MusicSubscription;