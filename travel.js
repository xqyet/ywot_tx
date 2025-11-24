// ==UserScript==
// @name         YWOT Canvas Navigator
// @namespace    http://tampermonkey.net/
// @version      6.0
// @description  Navigate using directions with stop command
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
    let navigationInterval = null;

    // Find the main container
    function getContainer() {
        return document.querySelector('#yourworld') ||
               document.querySelector('[id*="world"]') ||
               document.querySelector('body > div');
    }

    // Press a key
    function pressKey(container, key) {
        container.dispatchEvent(new KeyboardEvent('keydown', {
            key,
            code: key === 'ArrowRight' ? 'ArrowRight' : key === 'ArrowLeft' ? 'ArrowLeft' :
                  key === 'ArrowDown' ? 'ArrowDown' : 'ArrowUp',
            bubbles: true
        }));
    }

    // Navigate in a direction continuously
    window.go = function(direction) {
        // Stop any existing navigation
        if (navigationInterval) {
            clearInterval(navigationInterval);
        }

        shouldStop = false;
        direction = direction.toLowerCase();

        console.log(`[GO] Starting continuous navigation: ${direction}`);

        const container = getContainer();
        if (!container) {
            console.error('[GO] Container not found');
            return false;
        }

        container.focus();

        // Determine which keys to press based on direction
        let keys = [];
        switch(direction) {
            case 'north':
            case 'n':
            case 'up':
                keys = ['ArrowUp'];
                break;
            case 'south':
            case 's':
            case 'down':
                keys = ['ArrowDown'];
                break;
            case 'east':
            case 'e':
            case 'right':
                keys = ['ArrowRight'];
                break;
            case 'west':
            case 'w':
            case 'left':
                keys = ['ArrowLeft'];
                break;
            case 'northeast':
            case 'ne':
                keys = ['ArrowUp', 'ArrowRight'];
                break;
            case 'northwest':
            case 'nw':
                keys = ['ArrowUp', 'ArrowLeft'];
                break;
            case 'southeast':
            case 'se':
                keys = ['ArrowDown', 'ArrowRight'];
                break;
            case 'southwest':
            case 'sw':
                keys = ['ArrowDown', 'ArrowLeft'];
                break;
            default:
                console.error(`[GO] Unknown direction: ${direction}`);
                console.log('[GO] Valid directions: north, south, east, west, northeast, northwest, southeast, southwest');
                console.log('[GO] Or use: n, s, e, w, ne, nw, se, sw');
                return false;
        }

        // Press keys continuously
        navigationInterval = setInterval(() => {
            if (shouldStop) {
                clearInterval(navigationInterval);
                navigationInterval = null;
                console.log('[GO] Navigation stopped');
                return;
            }

            keys.forEach(key => pressKey(container, key));
        }, 10); // Press keys every 10ms

        console.log(`[GO] Navigating ${direction}... Type stop() to stop`);
    };

    // Stop command
    window.stop = function() {
        shouldStop = true;
        if (navigationInterval) {
            clearInterval(navigationInterval);
            navigationInterval = null;
        }
        console.log('%c[STOP] Navigation stopped!', 'color: #f00; font-weight: bold');
    };

    console.log('%c=== FUNCTIONS READY ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px');
    console.log('%cAvailable commands:', 'color: #0ff; font-weight: bold; font-size: 14px');
    console.log('  go(direction)  - Navigate continuously in a direction');
    console.log('  stop()         - Stop navigation');
    console.log('');
    console.log('%cDirections:', 'color: #0ff; font-weight: bold');
    console.log('  Cardinal: north, south, east, west (or n, s, e, w)');
    console.log('  Diagonal: northeast, northwest, southeast, southwest (or ne, nw, se, sw)');
    console.log('');
    console.log('%cExamples:', 'color: #ff0');
    console.log('  go("north")     - Go north continuously');
    console.log('  go("ne")        - Go northeast continuously');
    console.log('  stop()          - Stop moving');

})();
