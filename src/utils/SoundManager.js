// Sound effects manager
class SoundManager {    static sounds = {
        success: new Audio('/assets/sounds/success.mp3'),
        incorrect: new Audio('/assets/sounds/incorrect.mp3'),
        start: new Audio('/assets/sounds/startgame.mp3'),
        questionReveal: new Audio('/assets/sounds/questionon.mp3'),
        questionStart: new Audio('/assets/sounds/questionstart.mp3'),
        waitingResult: new Audio('/assets/sounds/waitingresult.mp3'),
        milestone: new Audio('/assets/sounds/milestone.mp3'), // Now loaded
        // Additional sounds (you can add more sound files later)
        lifeline: null, // Placeholder for lifeline sound
        finalAnswer: null, // Placeholder for final answer confirmation
        gameOver: null, // Placeholder for game over sound
        victory: null // Placeholder for winning the game sound
    };static isEnabled = true;
    static initialized = false;

    // Stop all currently playing sounds
    static stopAllSounds() {
        try {
            Object.values(this.sounds).forEach(sound => {
                if (sound && !sound.paused) {
                    sound.pause();
                    sound.currentTime = 0;
                }
            });
        } catch (error) {
            console.warn('Error stopping sounds:', error);
        }
    }

    // Simple initialization
    static init() {
        if (this.initialized) return;
        
        try {
            // Set basic audio properties
            Object.values(this.sounds).forEach(sound => {
                if (sound) {
                    sound.volume = 0.7;
                    sound.preload = 'auto';
                }
            });
            this.initialized = true;
            console.log('SoundManager initialized');
        } catch (error) {
            console.warn('Audio initialization failed:', error);
        }
    }    static playSound(soundName) {
        if (!this.isEnabled) return Promise.resolve();
        
        // Initialize if not done yet
        if (!this.initialized) {
            this.init();
        }
        
        // Stop all currently playing sounds before playing new one
        this.stopAllSounds();
        
        const sound = this.sounds[soundName];
        if (sound) {
            try {
                sound.currentTime = 0; // Reset the audio to start
                return sound.play();
            } catch (error) {
                console.warn(`Audio playback failed for ${soundName}:`, error);
                return Promise.reject(error);
            }
        }
        return Promise.resolve();
    }

    static toggleSound() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }

    static setSoundEnabled(enabled) {
        this.isEnabled = enabled;
    }

    // Public method to stop all sounds manually
    static stopAll() {
        this.stopAllSounds();
    }

    static playSuccess() {
        this.playSound('success');
    }

    static playIncorrect() {
        this.playSound('incorrect');
    }    static playStart() {
        return this.playSound('start');
    }

    static playQuestionReveal() {
        this.playSound('questionReveal');
    }

    static playQuestionStart() {
        return this.playSound('questionStart');
    }

    static playWaitingResult() {
        return this.playSound('waitingResult');
    }

    static playLifeline() {
        this.playSound('lifeline');
    }

    static playFinalAnswer() {
        this.playSound('finalAnswer');
    }    static playMilestone() {
        console.log('Playing milestone sound...');
        return this.playSound('milestone');
    }

    static playGameOver() {
        this.playSound('gameOver');
    }

    static playVictory() {
        this.playSound('victory');
    }
}

export default SoundManager;