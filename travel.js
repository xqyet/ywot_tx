// ==UserScript==
// @name         YWOT Canvas Navigator
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Navigate using keyboard with stop command
// @author       You
// @match        *://www.yourworldoftext.com/*
// @match        *://yourworldoftext.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c=== YWOT CANVAS NAVIGATOR ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px; font-size: 18px');

    // Global flag to stop navigation
    let shouldStop = false;
    let activeTimeouts = [];

    // Find the main container
    function getContainer() {
        return document.querySelector('#yourworld') ||
               document.querySelector('[id*="world"]') ||
               document.querySelector('body > div');
    }

    // Keyboard-based navigation
    window.navigateTo = function(x, y) {
        // Reset stop flag and clear previous timeouts
        shouldStop = false;
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];

        console.log(`[KEYBOARD] Navigating to (${x}, ${y}) using keyboard events`);

        const container = getContainer();
        if (!container) {
            console.error('[KEYBOARD] Container not found');
            return false;
        }

        container.focus();

        // Calculate direction and distance
        const stepsX = Math.abs(x);
        const stepsY = Math.abs(y);
        const rightKey = x > 0;
        const downKey = y > 0;

        // Simulate arrow key presses
        const pressKey = (key, times) => {
            for (let i = 0; i < times; i++) {
                const timeout = setTimeout(() => {
                    if (shouldStop) {
                        console.log('[KEYBOARD] Stopped by user');
                        return;
                    }

                    container.dispatchEvent(new KeyboardEvent('keydown', {
                        key,
                        code: key === 'ArrowRight' ? 'ArrowRight' : key === 'ArrowLeft' ? 'ArrowLeft' :
                              key === 'ArrowDown' ? 'ArrowDown' : 'ArrowUp',
                        bubbles: true
                    }));
                }, i * 10);

                activeTimeouts.push(timeout);
            }
        };

        pressKey(rightKey ? 'ArrowRight' : 'ArrowLeft', stepsX);
        pressKey(downKey ? 'ArrowDown' : 'ArrowUp', stepsY);

        console.log('[KEYBOARD] Keys queued');
    };

    // Stop command
    window.stop = function() {
        shouldStop = true;
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts = [];
        console.log('%c[STOP] Stopping navigation...', 'color: #f00; font-weight: bold');
    };

    console.log('%c=== FUNCTIONS READY ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px');
    console.log('%cAvailable commands:', 'color: #0ff; font-weight: bold; font-size: 14px');
    console.log('  navigateTo(x, y)  - Navigate using keyboard');
    console.log('  stop()            - Stop current navigation');
    console.log('');
    console.log('%cExample:', 'color: #ff0');
    console.log('  navigateTo(100, 100)  - Navigate to (100, 100)');
    console.log('  stop()                - Stop moving');

})();
