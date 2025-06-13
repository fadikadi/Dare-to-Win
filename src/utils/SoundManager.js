// Sound effects manager
class SoundManager {
    static sounds = {
        success: new Audio('/assets/sounds/success.mp3'),
        incorrect: new Audio('/assets/sounds/incorrect.mp3')
    };

    static playSound(soundName) {
        const sound = this.sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // Reset the audio to start
            sound.play().catch(error => {
                console.warn('Audio playback failed:', error);
            });
        }
    }

    static playSuccess() {
        this.playSound('success');
    }

    static playIncorrect() {
        this.playSound('incorrect');
    }
}

export default SoundManager;
