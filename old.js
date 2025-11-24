// ==UserScript==
// @name         YWOT Canvas Teleporter (No World Object)
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Teleport by directly manipulating canvas transform
// @author       You
// @match        *://www.yourworldoftext.com/*
// @match        *://yourworldoftext.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c=== YWOT CANVAS TELEPORTER ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px; font-size: 18px');
    console.log('[INFO] This version does NOT require finding the World object');
    console.log('[INFO] It works by simulating user interactions');

    // Find the main container
    function getContainer() {
        return document.querySelector('#yourworld') ||
               document.querySelector('[id*="world"]') ||
               document.querySelector('body > div');
    }

    // Simulate drag/pan
    function simulatePan(deltaX, deltaY, steps = 10) {
        const container = getContainer();
        if (!container) {
            console.error('[PAN] Cannot find container');
            return false;
        }

        console.log(`[PAN] Simulating pan: ΔX=${deltaX}, ΔY=${deltaY} in ${steps} steps`);

        const rect = container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Simulate mousedown
        const startX = centerX;
        const startY = centerY;

        container.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
            button: 0
        }));

        // Simulate drag in steps
        const stepX = deltaX / steps;
        const stepY = deltaY / steps;

        let currentStep = 0;
        const dragInterval = setInterval(() => {
            currentStep++;

            const moveX = startX + (stepX * currentStep);
            const moveY = startY + (stepY * currentStep);

            document.dispatchEvent(new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
                clientX: moveX,
                clientY: moveY
            }));

            if (currentStep >= steps) {
                clearInterval(dragInterval);

                // Simulate mouseup
                container.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    clientX: moveX,
                    clientY: moveY,
                    button: 0
                }));

                console.log('[PAN] Pan complete');
            }
        }, 16); // ~60fps

        return true;
    }

    // Teleport by panning
    window.panTo = function(tileX, tileY) {
        console.log(`[TELEPORT] Pan to approximate position (${tileX}, ${tileY})`);
        console.log('[TELEPORT] WARNING: This is approximate, not exact coordinates');

        const pixelsPerTile = 32; // Estimate: 8px char width * 4 chars per tile
        const pixelX = tileX * pixelsPerTile;
        const pixelY = tileY * pixelsPerTile;

        // Pan in chunks to avoid timeout
        const chunkSize = 5000;
        const chunksX = Math.ceil(Math.abs(pixelX) / chunkSize);
        const chunksY = Math.ceil(Math.abs(pixelY) / chunkSize);
        const totalChunks = Math.max(chunksX, chunksY);

        let currentChunk = 0;

        const panChunk = () => {
            if (currentChunk >= totalChunks) {
                console.log('[TELEPORT] Complete!');
                return;
            }

            const remainingX = pixelX - (currentChunk * chunkSize * Math.sign(pixelX));
            const remainingY = pixelY - (currentChunk * chunkSize * Math.sign(pixelY));

            const thisChunkX = Math.min(Math.abs(remainingX), chunkSize) * Math.sign(remainingX);
            const thisChunkY = Math.min(Math.abs(remainingY), chunkSize) * Math.sign(remainingY);

            console.log(`[TELEPORT] Chunk ${currentChunk + 1}/${totalChunks}: (${thisChunkX}, ${thisChunkY})`);

            simulatePan(thisChunkX, thisChunkY, 20);

            currentChunk++;
            setTimeout(panChunk, 500);
        };

        panChunk();
    };

    // Alternative: Try to find and manipulate the transform directly
    window.hackTransform = function(x, y) {
        console.log('[HACK] Trying direct transform manipulation...');

        const container = getContainer();
        if (!container) {
            console.error('[HACK] Container not found');
            return false;
        }

        // Try setting scroll position
        container.scrollLeft = x * 32;
        container.scrollTop = y * 32;

        console.log('[HACK] Set scroll:', container.scrollLeft, container.scrollTop);

        // Try CSS transform
        const pixelX = x * 32;
        const pixelY = y * 32;

        container.style.transform = `translate(${-pixelX}px, ${-pixelY}px)`;
        console.log('[HACK] Set CSS transform');

        // Try all child elements
        container.querySelectorAll('*').forEach((el, idx) => {
            if (idx < 5) { // Only first few to avoid spam
                el.style.transform = `translate(${-pixelX}px, ${-pixelY}px)`;
            }
        });

        return true;
    };

    // Keyboard-based navigation
    window.navigateTo = function(x, y) {
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
                setTimeout(() => {
                    container.dispatchEvent(new KeyboardEvent('keydown', {
                        key,
                        code: key === 'ArrowRight' ? 'ArrowRight' : key === 'ArrowLeft' ? 'ArrowLeft' :
                              key === 'ArrowDown' ? 'ArrowDown' : 'ArrowUp',
                        bubbles: true
                    }));
                }, i * 10);
            }
        };

        pressKey(rightKey ? 'ArrowRight' : 'ArrowLeft', stepsX);
        pressKey(downKey ? 'ArrowDown' : 'ArrowUp', stepsY);

        console.log('[KEYBOARD] Keys sent');
    };

    console.log('%c=== FUNCTIONS READY ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px');
    console.log('%cAvailable commands:', 'color: #0ff; font-weight: bold; font-size: 14px');
    console.log('  panTo(x, y)        - Pan to coordinates (slow but works)');
    console.log('  hackTransform(x,y) - Try direct manipulation (experimental)');
    console.log('  navigateTo(x, y)   - Use keyboard navigation (experimental)');
    console.log('');
    console.log('%cExample:', 'color: #ff0');
    console.log('  panTo(100, 100)    - Pan to tile (100, 100)');
    console.log('');
    console.log('%cNOTE: These methods are workarounds and may not work perfectly.', 'color: #f80');

})();
