// ==UserScript==
// @name         YWOT Mass Eraser
// @namespace    http://tampermonkey.net/
// @version      3.0
// @description  Backspace in columns, return to start position
// @author       You
// @match        *://www.yourworldoftext.com/*
// @match        *://yourworldoftext.com/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    console.log('%c=== YWOT MASS ERASER ===', 'background: #f00; color: #fff; font-weight: bold; padding: 10px; font-size: 18px');

    let shouldStop = false;

    function getContainer() {
        return document.querySelector('#yourworld') ||
               document.querySelector('[id*="world"]') ||
               document.querySelector('body > div');
    }

    // Erase in a grid pattern - returns to starting column each time
    window.eraseGrid = function(backspaces = 10, rows = 50) {
        shouldStop = false;
        console.log(`[ERASE] Starting grid erase: ${backspaces} backspaces x ${rows} rows`);

        const container = getContainer();
        if (!container) {
            console.error('[ERASE] Container not found');
            return false;
        }

        container.focus();

        let row = 0;

        const eraseRow = () => {
            if (shouldStop) {
                console.log('[ERASE] Stopped!');
                return;
            }

            if (row >= rows) {
                console.log(`[ERASE] Complete! Erased ${backspaces}x${rows} grid`);
                return;
            }

            console.log(`[ERASE] Row ${row + 1}/${rows}`);

            // Backspace X times
            for (let i = 0; i < backspaces; i++) {
                setTimeout(() => {
                    if (!shouldStop) {
                        container.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'Backspace',
                            code: 'Backspace',
                            keyCode: 8,
                            bubbles: true,
                            cancelable: true
                        }));
                    }
                }, i * 10);
            }

            // After backspacing, move RIGHT to return to start position
            setTimeout(() => {
                if (shouldStop) return;

                for (let i = 0; i < backspaces; i++) {
                    setTimeout(() => {
                        if (!shouldStop) {
                            container.dispatchEvent(new KeyboardEvent('keydown', {
                                key: 'ArrowRight',
                                code: 'ArrowRight',
                                bubbles: true
                            }));
                        }
                    }, i * 10);
                }

                // Then move down one row
                setTimeout(() => {
                    if (shouldStop) return;

                    container.dispatchEvent(new KeyboardEvent('keydown', {
                        key: 'ArrowDown',
                        code: 'ArrowDown',
                        bubbles: true
                    }));

                    row++;
                    setTimeout(eraseRow, 100);

                }, backspaces * 10 + 50);

            }, backspaces * 10 + 50);
        };

        eraseRow();
    };

    window.stop = function() {
        shouldStop = true;
        console.log('%c[STOP] Stopping erase...', 'color: #f00; font-weight: bold');
    };

    console.log('%c=== FUNCTIONS READY ===', 'background: #f00; color: #fff; font-weight: bold; padding: 10px');
    console.log('%cCommands:', 'color: #0ff; font-weight: bold');
    console.log('  eraseGrid(backspaces, rows) - Backspace X, return to start, move down, repeat');
    console.log('  stop()                       - Stop erasing');
    console.log('');
    console.log('%cExamples:', 'color: #ff0');
    console.log('  eraseGrid(10, 50)   - Delete 10 chars per row, 50 rows');
    console.log('  eraseGrid(20, 100)  - Delete 20 chars per row, 100 rows');
    console.log('  stop()              - Stop');
    console.log('');
    console.log('%cNow with proper column alignment!', 'color: #0f0');

})();
