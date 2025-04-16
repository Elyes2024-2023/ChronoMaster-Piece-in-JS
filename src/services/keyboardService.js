class KeyboardService {
  constructor() {
    this.shortcuts = new Map();
    this.isEnabled = true;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  register(key, callback, description) {
    this.shortcuts.set(key.toLowerCase(), {
      callback,
      description
    });
  }

  unregister(key) {
    this.shortcuts.delete(key.toLowerCase());
  }

  handleKeyDown(event) {
    if (!this.isEnabled) return;
    
    // Ignore shortcuts when typing in input fields
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }
    
    const key = event.key.toLowerCase();
    const shortcut = this.shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      shortcut.callback();
    }
  }

  getShortcutsList() {
    return Array.from(this.shortcuts.entries()).map(([key, { description }]) => ({
      key,
      description
    }));
  }
}

export const keyboardService = new KeyboardService();

// Initialize keyboard event listener
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (event) => {
    keyboardService.handleKeyDown(event);
  });
} 