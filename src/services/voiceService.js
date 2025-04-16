class VoiceService {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.selectedVoice = null;
    this.isEnabled = false;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;

    // Load voices
    const loadVoices = () => {
      this.voices = this.synth.getVoices();
      
      // Try to find a female English voice
      this.selectedVoice = this.voices.find(
        voice => voice.lang.includes('en') && voice.name.includes('Female')
      ) || this.voices.find(
        voice => voice.lang.includes('en')
      ) || this.voices[0];
      
      this.initialized = true;
    };

    // Chrome loads voices asynchronously
    if (this.synth.getVoices().length) {
      loadVoices();
    } else {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  enable() {
    this.isEnabled = true;
    this.init();
  }

  disable() {
    this.isEnabled = false;
    this.synth.cancel();
  }

  speak(text) {
    if (!this.isEnabled || !this.initialized) return;

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    this.synth.speak(utterance);
  }

  announceTime(hours, minutes) {
    if (!this.isEnabled) return;
    
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    
    let timeText = `The time is ${hour12} ${minutes} ${period}`;
    
    if (minutes === 0) {
      timeText = `It's ${hour12} o'clock ${period}`;
    } else if (minutes < 10) {
      timeText = `The time is ${hour12} oh ${minutes} ${period}`;
    }
    
    this.speak(timeText);
  }
}

export const voiceService = new VoiceService(); 