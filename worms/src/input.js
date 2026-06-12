// src/Input.js
export class InputManager {
    constructor() {
        this.keys = {};
        
        // Captura quando a tecla é pressionada
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });

        // Captura quando a tecla é solta
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }

    // Método rápido para checar o status de uma tecla
    isPressed(key) {
        return !!this.keys[key.toLowerCase()];
    }
}