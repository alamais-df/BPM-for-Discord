/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Adds the search button to the discord UI
 **/
require('!style!css!./search.css');

var BPM_utils = require('../utils.js'),
    searchButton;

// We rely on BPM's core code to attach this listener.
// We also store this button in a module-global scope 
// because we are bad people and cannot maintain a consistent
// reference to it otherwise.
function createSearchButton(prefs) {
    var className = prefs.searchButtonTopRight ? 'header-toolbar' : 'guilds-wrapper';
    BPM_utils.waitForElementByClass(className, function(container) {
        var elementType = prefs.searchButtonTopRight ? 'button' : 'div';
        
        searchButton = document.createElement(elementType);
        searchButton.className = 'bpm-emote-search-button' + 
            (prefs.searchButtonTopRight ? '' : ' bpm-emote-search-button-bottom-left');
        
        container.appendChild(searchButton);
        if(prefs.searchButtonTopRight) {
            listenOnAppChange();
        }
    });
}

function listenOnAppChange() {
    var appDiv = document.getElementsByClassName('app')[0];
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(e) {
            var headerToolbar = document.getElementsByClassName('header-toolbar')[0];
            if(!headerToolbar) {
                return;
            }
            
            var button = document.getElementsByClassName('bpm-emote-search-button')[0];
            var firstToolbarButton = headerToolbar.childNodes[0];
            if(button) {
                // Move the button to the farthest-left position
                if (firstToolbarButton && firstToolbarButton !== button) {
                    headerToolbar.insertBefore(searchButton, firstToolbarButton); 
                }
                return;
            }
            
            if(!firstToolbarButton) {
                headerToolbar.appendChild(searchButton);
            } else {
                headerToolbar.insertBefore(searchButton, firstToolbarButton); 
            }
        });
    });

    observer.observe(appDiv, { childList: true, subtree: true });
}

// So:  we need to somehow init prefs BEFORE binding the listener
// to the search button.  This means we probably need to actually
// create some kind of message to bind the search button once it's 
// done being created but AFTER prefs.  Oy vey.
window.setTimeout(function() {
    BPM_utils.retrievePrefs(createSearchButton);
}, 500);
console.log('waiting for search prefs');

