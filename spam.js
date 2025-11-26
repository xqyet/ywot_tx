// ==UserScript==
// @name         YWOT Canvas Teleporter + Auto Type
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Teleport by directly manipulating canvas transform + Type text on click
// @author       You
// @match        *://www.yourworldoftext.com/*
// @match        *://yourworldoftext.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c=== YWOT CANVAS TELEPORTER + AUTO TYPE ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px; font-size: 18px');

    // Text to type on click
    const TEXT_TO_TYPE = "www.xque.dev";

    // Function to simulate typing
    function typeText(text, targetElement) {
        console.log(`[TYPE] Typing: "${text}"`);

        // Split text into individual characters
        const chars = text.split('');

        // Type each character with a small delay
        chars.forEach((char, index) => {
            setTimeout(() => {
                // Simulate keydown event
                const keydownEvent = new KeyboardEvent('keydown', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    keyCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true,
                    cancelable: true
                });

                // Simulate keypress event
                const keypressEvent = new KeyboardEvent('keypress', {
                    key: char,
                    code: `Key${char.toUpperCase()}`,
                    keyCode: char.charCodeAt(0),
                    which: char.charCodeAt(0),
                    bubbles: true,
                    cancelable: true
                });

                // Simulate input event
                const inputEvent = new InputEvent('input', {
                    data: char,
                    bubbles: true,
                    cancelable: true
                });

                // Dispatch events
                targetElement.dispatchEvent(keydownEvent);
                targetElement.dispatchEvent(keypressEvent);
                targetElement.dispatchEvent(inputEvent);

                // Also try directly inserting text if there's a contenteditable or input
                if (targetElement.isContentEditable) {
                    document.execCommand('insertText', false, char);
                } else if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
                    targetElement.value += char;
                }

            }, index * 20); // 50ms delay between characters
        });
    }

    // Add click event listener to the document
    document.addEventListener('click', function(e) {
        console.log('[CLICK] Click detected at:', e.clientX, e.clientY);

        // Get the target element
        let target = e.target;

        // Try to find the main canvas/text area
        const container = document.querySelector('#yourworld') ||
                         document.querySelector('[id*="world"]') ||
                         document.body;

        // Focus the container first
        if (container) {
            container.focus();
        }

        // Small delay to ensure focus is set
        setTimeout(() => {
            typeText(TEXT_TO_TYPE, target.isContentEditable ? target : document.activeElement || document.body);
        }, 100);

    }, true); // Use capture phase to catch events early

    // Original teleport functions below...
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

        const startX = centerX;
        const startY = centerY;

        container.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
            button: 0
        }));

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

                container.dispatchEvent(new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    clientX: moveX,
                    clientY: moveY,
                    button: 0
                }));

                console.log('[PAN] Pan complete');
            }
        }, 16);

        return true;
    }

    window.panTo = function(tileX, tileY) {
        console.log(`[TELEPORT] Pan to approximate position (${tileX}, ${tileY})`);

        const pixelsPerTile = 32;
        const pixelX = tileX * pixelsPerTile;
        const pixelY = tileY * pixelsPerTile;

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

            simulatePan(thisChunkX, thisChunkY, 20);

            currentChunk++;
            setTimeout(panChunk, 500);
        };

        panChunk();
    };

    window.hackTransform = function(x, y) {
        console.log('[HACK] Trying direct transform manipulation...');
        const container = getContainer();
        if (!container) return false;

        container.scrollLeft = x * 32;
        container.scrollTop = y * 32;

        const pixelX = x * 32;
        const pixelY = y * 32;

        container.style.transform = `translate(${-pixelX}px, ${-pixelY}px)`;

        container.querySelectorAll('*').forEach((el, idx) => {
            if (idx < 5) {
                el.style.transform = `translate(${-pixelX}px, ${-pixelY}px)`;
            }
        });

        return true;
    };

    window.navigateTo = function(x, y) {
        console.log(`[KEYBOARD] Navigating to (${x}, ${y})`);
        const container = getContainer();
        if (!container) return false;

        container.focus();

        const stepsX = Math.abs(x);
        const stepsY = Math.abs(y);
        const rightKey = x > 0;
        const downKey = y > 0;

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
    };

    console.log('%c=== FUNCTIONS READY ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px');
    console.log('%cNEW: Left-click anywhere to type "' + TEXT_TO_TYPE + '"', 'color: #0f0; font-weight: bold');
    console.log('%cOriginal commands still available:', 'color: #0ff; font-weight: bold');
    console.log('  panTo(x, y), hackTransform(x,y), navigateTo(x, y)');

})();
