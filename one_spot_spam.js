// ==UserScript==
// @name         YWOT Canvas Teleporter + Auto Type + Spam
// @namespace    http://tampermonkey.net/
// @version      7.1
// @description  Type text on click, then spam it in the same spot every 2 seconds
// @author       You
// @match        *://www.yourworldoftext.com/*
// @match        *://yourworldoftext.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c=== YWOT CANVAS TELEPORTER + AUTO TYPE + SPAM ===', 'background: #00f; color: #fff; font-weight: bold; padding: 10px; font-size: 18px');

    // Text to type on click
    const TEXT_TO_TYPE = "www.xque.dev";
    const SPAM_DELAY = 6000; // 2 seconds

    let spamInterval = null;

    // Function to simulate typing
    function typeText(text, targetElement, moveBack = true) {
        console.log(`[TYPE] Typing: "${text}"`);

        // Split text into individual characters
        const chars = text.split('');

        // Type each character
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

            }, index * 20);
        });

        // Move cursor back to starting position if needed
        if (moveBack) {
            setTimeout(() => {
                for (let i = 0; i < text.length; i++) {
                    setTimeout(() => {
                        targetElement.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'ArrowLeft',
                            code: 'ArrowLeft',
                            bubbles: true,
                            cancelable: true
                        }));
                    }, i * 10);
                }
            }, (chars.length * 20) + 100); // Wait for typing to finish
        }
    }

    // Add click event listener to the document
    document.addEventListener('click', function(e) {
        console.log('[CLICK] Click detected at:', e.clientX, e.clientY);

        // Stop any existing spam
        if (spamInterval) {
            clearInterval(spamInterval);
            spamInterval = null;
            console.log('[SPAM] Stopped previous spam');
        }

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
            const typeTarget = target.isContentEditable ? target : document.activeElement || document.body;

            // Type immediately AND move back
            typeText(TEXT_TO_TYPE, typeTarget, true);

            // Start spam after 2 seconds
            setTimeout(() => {
                console.log('[SPAM] Starting spam every 2 seconds at same position...');
                spamInterval = setInterval(() => {
                    typeText(TEXT_TO_TYPE, typeTarget, true); // Move back after typing
                }, SPAM_DELAY);
            }, SPAM_DELAY);

        }, 100);

    }, true);

    // Stop spam command
    window.stopSpam = function() {
        if (spamInterval) {
            clearInterval(spamInterval);
            spamInterval = null;
            console.log('%c[STOP] Spam stopped!', 'color: #f00; font-weight: bold');
        }
    };

    // Original teleport functions below...
    function getContainer() {
        return document.querySelector('#yourworld') ||
               document.querySelector('[id*="world"]') ||
               document.querySelector('body > div');
    }

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
    console.log('%cLeft-click to type "' + TEXT_TO_TYPE + '" then spam IN SAME SPOT every 2 sec', 'color: #0f0; font-weight: bold');
    console.log('%cUse stopSpam() to stop', 'color: #ff0');
    console.log('%cOriginal commands:', 'color: #0ff; font-weight: bold');
    console.log('  panTo(x, y), hackTransform(x,y), navigateTo(x, y)');

})();
