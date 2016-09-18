module.exports = {
    init: initCustomCssSubpanel,
    teardown: teardownCustomCssSubpanel,
    html: require('raw!./html/custom-css.html')
};

var BPM_utils = require('../utils.js');
/**

Prefs key is 'customCSSSubreddits'
Things we need to do:
 1.  On subreddit add, add the subreddit to the preferences, then send a background message 
     to perform `bpm_prefs.sync_key("customCSSSubreddits")`.  Make sure we check for /r/ and that we 
     don't add a duplicate subreddit
 2.  On subreddit delete, remove the key from prefs and sync the prefs key again.    
**/

function initCustomCssSubpanel(subpanel) {
    function initPanel(prefs) {
        var subredditList = document.getElementById('bpm-option-custom-subreddit-list'),
            addButton = document.getElementById('bpm-option-add-custom-subreddit-button');

        Object.keys(prefs.customCSSSubreddits).forEach(function(subreddit) {
            createSubredditRow(subredditList, prefs, subreddit);
        });
        addButton.addEventListener('click', createAddSubredditHandler(subredditList, prefs));
    }
    BPM_utils.retrievePrefs(initPanel);
}

function createAddSubredditHandler(listElement, prefs) {
    function addCustomCSSSubreddit(e) {
        var input = document.getElementById('bpm-option-add-custom-subreddit-input'),
            appendedValue = input.value.startsWith('/r/') ? input.value.slice(3) : input.value,
            prefValue = appendedValue.toLowerCase();

        prefs.customCSSSubreddits[prefValue] = 0;
        BPM_utils.setOption('customCSSSubreddits', prefs.customCSSSubreddits);
        createSubredditRow(listElement, prefs, prefValue);
        input.value = '';
    }
    return addCustomCSSSubreddit;
}

function createSubredditRow(subredditListElement, prefs, subredditName) {
    var li = document.createElement('li');
    li.className = 'bpm-custom-subreddit-row';
    li.id = 'bpm-custom-subreddit-row-' + subredditName;
    
    var nameSpan = document.createElement('span');
    nameSpan.className = 'bpm-custom-subreddit-name';
    nameSpan.appendChild(document.createTextNode(subredditName));
    
    li.appendChild(nameSpan);

    var forceUpdateButton = document.createElement('button');
    forceUpdateButton.appendChild(document.createTextNode('Force Update'));
    forceUpdateButton.addEventListener('click', function(e) {
        e.preventDefault();        
        console.log('forced update!');
    });

    li.appendChild(forceUpdateButton);

    var removeButton = document.createElement('button');
    removeButton.appendChild(document.createTextNode('Remove'));
    removeButton.addEventListener('click', function(e) {
        e.preventDefault();        
        prefs.customCSSSubreddits[subredditName] = undefined;
        BPM_utils.setOption('customCSSSubreddits', prefs.customCSSSubreddits);
        teardownSubredditRow(li);
        subredditListElement.removeChild(li);
    });

    li.appendChild(removeButton);
    subredditListElement.appendChild(li);
}

function teardownSubredditRow(row) {
    BPM_utils.htmlCollectionToArray(row.children)
       .filter(function(child) { return child.tagName === 'BUTTON'; })
       .forEach(function(button) { button.removeEventListener('click'); }); 
}

function teardownCustomCssSubpanel(subpanel) {
    var subredditList = document.getElementById('bpm-option-custom-subreddit-list');
    subredditList.children.forEach(function(child) { 
        teardownSubredditRow(child); 
    });

    document.getElementById('bpm-option-add-custom-subreddit-button').removeEventListener('click');
}

