/**
 * BPM for Discord
 * (c) 2015-2016 ByzantineFailure
 *
 * Adds the search button to the discord UI
 **/
require('!style!css!./search.css');

var BPM_utils = require('../utils.js'),
    searchButton;


function modifyHelpContainer(container) {
    container.className += ' bpm-help-container';
    createSearchButton(container);
}

// We rely on BPM's core code to attach this listener.
// We also store this button in a module-global scope 
// because we are bad people and cannot maintain a consistent
// reference to it otherwise.
function createSearchButton(container) {
    searchButton = document.createElement('button');
    searchButton.className = 'bpm-emote-search-button';
    
    container.appendChild(searchButton);
    listenOnAppChange();
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

BPM_utils.waitForElementByClass('header-toolbar', createSearchButton);

