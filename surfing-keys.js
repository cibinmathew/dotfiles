
browser = (function() {
    return window.msBrowser || chrome ||
        browser;
})();

window.browser = (function() {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))



const {
    // https://github.com/brookhong/Surfingkeys/wiki/Migrate-your-settings-from-0.9.74-to-1.0
    aceVimMap,
    mapkey,
    imap,
    imapkey,
    getClickableElements,
    vmapkey,
    map,
    unmap,
    cmap,
    addSearchAlias,
    removeSearchAlias,
    tabOpenLink,
    readText,
    Clipboard,
    Front,
    Hints,
    Visual,
    RUNTIME
} = api;


settings.nextLinkRegex=/((>>|next|load more|show more)+)/i;
settings.hintAlign = "left";
settings.omnibarPosition  = "top";
settings.focusFirstCandidate = true; // Whether to focus first candidate of matched result in Omnibar.

settings.focusAfterClosed = "last"; // Which tab will be focused after the current tab is closed. ["left", "right", "last"]
//emoji suggestions popup as soon as you input colon, use below:
settings.startToShowEmoji = 1;
api.iunmap(":");  // Disabling emoji for now

// Unmap dangerous 'reset settings' shortcut
unmap('sr');

// use f to cancel key combos
unmap('gf');
unmap('sf');

addSearchAlias('y', 'Youtube', 'https://www.youtube.com/results?search_query=');
// create a key to search in git gist stack

// styles
Hints.style('border: solid 3px #3a5f82; color:#fff; background: initial; background-color: #3a5f82; font-size: 10pt;');
Visual.style('marks', 'background-color: #89a1e2;');
Visual.style('cursor', 'background-color: #6590b7;');

map('yt', 'yT'); // TODO yT is hard to reach. Interchange yt & yT

map('gn', ']]'); // next link
// map('gp', '[['); // prev link  // TODO commented for 'gp': goto currently playing tab

map('t', 'af'); // put before a or af is re mapped

map('a', 'gg');
map('gz', 'g$');  // goto last tab
unmap('ga');
map('gaa', 'g0'); // goto first tab
map('g;', 'g0'); // TODO change this to a better one
map('<Ctrl-;>', 'g$');
imapkey('<Ctrl-;>', 'goto rightmost tab', function() { api.Normal.feedkeys('99R');});
map('<Ctrl-:>', 'g0');  // TODO didnt work

// Prefer Alt instead of Command in MacOs as well
map('<Alt-1>', 'g0');   // TODO add 2-8 also

// history F and S
mapkey('H', '#4Go back in history', function() {history.go(-1), {repeatIgnore: true}});

mapkey('L', '#4Go one tab history forward', function() { RUNTIME("historyTab", {backward: false}), {repeatIgnore: true}});

map('k', 'e');
map('j', 'd');
map('<Ctrl-j>', 'd');
map('<Ctrl-k>', 'e');

// TODO get back support for 'Normal'
// mapkey('<Alt-L>', '#2Scroll down',  function() { Normal.scroll("pageDown");  }, {repeatIgnore: true});  // TODO make this more speedier than 'j'
mapkey('J', '#2Scroll down', function() {api.Normal.scroll("down"), {repeatIgnore: true}});
mapkey('K', '#2Scroll up', function() {api.Normal.scroll("up"), {repeatIgnore: true}});


map('<Ctrl-l>', 'R');

map('h', 'E');
map('l', 'R');
mapkey('d', 'close and Previous', function() {RUNTIME("closeTab"); RUNTIME("previousTab")});
map('u', 'X');

mapkey('ggi', 'test', function() {
    var inputs = document.getElementsByTagName('input');
    var input = null;
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == 'text') {
            input = inputs[i];
            break;
        }
    }
    if (input) {
        input.click();
        input.focus();
    }
}
      );

// Buffers
mapkey('b', '#3Choose a tab', function() {Front.chooseTab();});
map('<Ctrl-x>b', 'b');

map('gl', 'G');
map('.', 'G');
map('<Ctrl-x>=','zi');
map('<Ctrl-x>-','zo');
unmap('Z');
map('Z', 'z');  // TODO now working (ZZ,ZR)
unmap('z');
map('z', 'G');
map('Gl', 'g$');
//ssg
//ssog
map('sg', 'sG'); // google interactive search
map('sog', 'soG'); // google interactive site search

map(';', '/');
// map('/', ';');
// mapkey(';', '#9Find in current page', function() {Front.openFinder()});

map('[', '[[');

//map('/',']]');
mapkey('/', '#1Click on the next link on current page', function() {
    var nextLinks = $('a').regex(/((>>|next)+)/i);
    if (nextLinks.length) {
        clickOn(nextLinks);
    } else {
        walkPageUrl(1);
    }
});

// map('gj';j']]');//                    Close Downloads Shelf
// map('y','<Esc>');

unmap('<Ctrl-f>');

mapkey('F', '#1Open a link in non-active new tab', function() {Hints.create("", Hints.dispatchMouseClick, {tabbed: true, active: false})});
mapkey('F', '#7 message', function () {    alert('use t');});

mapkey('cf', '#1Open multiple links in a new tab', function() {Hints.create("", Hints.dispatchMouseClick, {tabbed: true, active: false, multipleHits: true})});
 
mapkey('cf', '#1Open a link in current tab', function() {
    Hints.create("", Hints.dispatchMouseClick, 
    {tabbed: false, active: false});
})


api.Hints.setCharacters('hgaslmnd');
// todo scrollKeys change
api.Hints.scrollKeys = '0jkhlG$'; //The keys that can be used to scroll page in hints mode. You need not change it unless that you have changed Hints.characters.
// f to turn it off again


// mapkey('f', 'Choose a tab', 'Front.chooseTab()', {domain: /github\.com/i});

function google_first_result() {


    // links = document.evaluate("//div[@class='r']/a", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);  // <-- Not working now
    // links = document.evaluate("//div[@class='g']//a[contains(@ping,'/url')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    links = document.evaluate("//div[@class='g']//a[not(@class='fl') and contains(@ping,'/url')]", document, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
    // TODO still there are few false positive matches

    var link = []; // new Array(5);
     
    for (let i=0; i<5;i++)
    {
        node = links.iterateNext();
        if(node)    
            link.push(node.href);
    }
    browser.storage.local.set({
        "visited_url": 0
    });
    
    var json_data = {
        "all_links": JSON.stringify(link)
    };
    browser.storage.local.set(json_data, function() {});
}

function google_next_result(window_loc, n = 0) {

    var links = new Array(5);
    var count = 1;
    browser.storage.local.get( /* String or Array */ ["all_links"], function(items) {
        links = JSON.parse(items["all_links"]);
    });
    browser.storage.local.get( /* String or Array */ ["visited_url"], function(items) {
        if (n == 0)
            count = JSON.parse(items["visited_url"]);
        else
            count = n;
        var win;
        if (window_loc == 0) {
            win = window.open(links[count], "_self");
        } else {
            win = window.open(links[count], "_blank");
        }
        count = count + 1;
        browser.storage.local.set({ "visited_url": count });
    });
}

mapkey('e', '#8Open Search with google',
    function() {
        Front.openOmnibar({
            type: "SearchEngine",
            extra: "g",
            tabbed: false
        });
    });

// todo sj open next 3 tabs and focus first
//mapkey('sj', 'google next result', google_next_result);
mapkey('s', 'google next result', function() {
    google_next_result(0);
});

mapkey('s', 'google first result', async function() {
    Front.showBanner("opening first result");
    await sleep(700);
    google_first_result();
    google_next_result(0);
}, {
    domain: /google\.(co\.in|com|in)/i
});

// w kill and open

mapkey('w', 'google open next result', async function() {
    Front.showBanner("opening NEXT result");
    await sleep(700);
    google_next_result(1);
});

mapkey('w', 'google first result',function(){google_first_result(); google_next_result(1);}, {domain: /google\.(co\.in|com|in)/i});

mapkey(',aw', 'google nth result',function(){ google_first_result(); google_next_result(1,0); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',bw', 'google nth result',function(){ google_first_result(); google_next_result(1,1); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',cw', 'google nth result',function(){ google_first_result(); google_next_result(1,2); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',dw', 'google nth result',function(){ google_first_result(); google_next_result(1,3); }, {domain: /google\.(co\.in|com|in)/i});

mapkey(',as', 'google nth result here',function(){ google_first_result(); google_next_result(0,0); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',bs', 'google nth result here',function(){ google_first_result(); google_next_result(0,1); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',cs', 'google nth result here',function(){ google_first_result(); google_next_result(0,2); }, {domain: /google\.(co\.in|com|in)/i});
mapkey(',ds', 'google nth result here',function(){ google_first_result(); google_next_result(0,3); }, {domain: /google\.(co\.in|com|in)/i});

//mapkey('gk', 'google open next result',google_next_result(0));
//n in google takes to next page

// todo
//map('n',']]', {domain: /google\.(co\.in|com|in)/i});

// TODO get back 'normal'
// mapkey('n', 'next page', function() {api.Normal.scroll("bottom"); nextPage(); },{domain: /google\.(co\.in|com|in)/i}); 
// mapkey('p', 'previous Page', function() {api.Normal.scroll("bottom"); previousPage(); },{domain: /google\.(co\.in|com|in)/i});


// google filter
mapkey('gfoh' , 'only this hour'  , function() {   open_in_date("h");  } , {domain: /google\.(co\.in|com|in)/i } );
mapkey('gfow' , 'only this week'  , function() {   open_in_date("w");  } , {domain: /google\.(co\.in|com|in)/i } );
mapkey('gfod' , 'only this day'   , function() {    open_in_date("d"); } , {domain: /google\.(co\.in|com|in)/i } );
mapkey('gfoy' , 'only this year'  , function() {   open_in_date("y");  } , {domain: /google\.(co\.in|com|in)/i } );
mapkey('gfom' , 'only this month' , function() {  open_in_date("m");   } , {domain: /google\.(co\.in|com|in)/i } );
mapkey('gfor' , 'reset date'      , function() {   open_in_date("r");  } , {domain: /google\.(co\.in|com|in)/i } );


mapkey('gfoa', 'google all search', function() {


    // replace the query parameter value with new query and value
    window.location.href = window.location.href.replace(/(tbm=)[^\&]+/, '');

},{domain: /google\.(co\.in|com|in)/i});

mapkey('gfoi', 'google image', function() {

    window.location.href = window.location.href + "&tbm=isch";
},{domain: /google\.(co\.in|com|in)/i});

mapkey('gfon', 'google news', function() {

    window.location.href = window.location.href + "&tbm=nws";
},{domain: /google\.(co\.in|com|in)/i});

function open_in_date(date) {
    if (date === "r") {

        // replace the query parameter value with new query and value
        window.location.href = window.location.href.replace(/(tbs=)[^\&]+/, '');

    } else

        window.location.href = window.location.href + "&tbs=qdr:" + date;
}

//https://github.com/b0o/surfingkeys-conf/blob/master/conf.js

//---- Mapkeys ----//
let ri = {
    repeatIgnore: true
};
mapkey('=w', "Lookup whois information for domain", whois, ri);
mapkey('=d', "Lookup dns information for domain", dns, ri);
mapkey('=D', "Lookup all information for domain", dnsVerbose, ri);
mapkey(';se', "#11Edit Settings", editSettings, ri);
mapkey(';pd', "Toggle PDF viewer from SurfingKeys", togglePdfViewer, ri);
mapkey('gi', "Edit current URL with vim editor", vimEditURL, ri);

function mapsitekey(domainRegex, key, desc, f, opts) {
    opts = opts || {};
    mapkey(`\\${key}`, desc, f, Object.assign({}, opts, {
        domain: domainRegex
    }));
}

function mapsitekeys(domainRegex, maps) {
    maps.forEach(function(map) {
        mapsitekey(domainRegex, map[0], map[1], map[2]);
    });
}

mapsitekeys(/(youtube\.com)/i, [
    ['F', "Toggle fullscreen", ytFullscreen],
]);

mapsitekeys(/(vimeo\.com)/i, [
    ['F', "Toggle fullscreen", vimeoFullscreen],
]);

mapsitekeys(/(github\.com)/i, [
    ['s', "Toggle Star", ghToggleStar],
]);

function ytFullscreen() {
    $('.ytp-fullscreen-button.ytp-button').click();
}

function vimeoFullscreen() {
    $('.fullscreen-icon').click();
}

function ghToggleStar() {
    var repo = window.location.pathname.slice(1).split("/").slice(0, 2).join("/");
    var cur = $('div.starring-container > form').filter(function() {
        return $(this).css("display") === "block";
    });

    var action = "starred";
    var star = "★";
    if ($(cur).attr("class").indexOf("unstarred") === -1) {
        action = "un" + action;
        star = "☆";
    }

    $(cur).find("button").click();
    Front.showBanner(star + " Repository " + repo + " " + action);
}

function whois() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dns() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_dns=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function dnsVerbose() {
    var url = "http://centralops.net/co/DomainDossier.aspx?dom_whois=true&dom_dns=true&traceroute=true&net_whois=true&svc_scan=true&addr=" + window.location.hostname;
    window.open(url, '_blank').focus();
}

function togglePdfViewer() {
    chrome.storage.local.get("noPdfViewer", function(resp) {
        if (!resp.noPdfViewer) {
            chrome.storage.local.set({
                "noPdfViewer": 1
            }, function() {
                Front.showBanner("PDF viewer disabled.");
            });
        } else {
            chrome.storage.local.remove("noPdfViewer", function() {
                Front.showBanner("PDF viewer enabled.");
            });
        }
    });
}



function vimEditURL() {
    Front.showEditor(window.location.href, function(data) {
        window.location.href = data;
    }, 'url');
}


function editSettings() {
    tabOpenLink("/pages/options.html");
}



// Omnibar
unmap('on');
mapkey("b", 'Choose a tab with omnibar', () => {    Front.openOmnibar({type: "Tabs"}); });
mapkey('op', '#3Open Chrome newtab/Page', function() { tabOpenLink("chrome://newtab/");});
mapkey('ono', '#8Open a URL', function() {     Front.openOmnibar({type: "URLs", extra: "getAllSites"});});
mapkey('om', '#8Open URL from vim-like marks', function() {    Front.openOmnibar({type: "VIMarks"});});
mapkey('ozc', '#8Open URL from history',          function() {    Front.openOmnibar({type: "History", tabbed: false, pref: "buildgithub"});});


mapkey('oo', '#8Open a URL in current tab (history+bookmarks)',      function() {     Front.openOmnibar({type: "URLs", extra: "getAllSites", tabbed: false });});
mapkey('ox', '#8Open recently closed URL',       function() {    Front.openOmnibar({type: "URLs", extra: "getRecentlyClosed", tabbed: false});});
mapkey('ot', '#8Open opened URL in current tab', function() {    Front.openOmnibar({type: "URLs", extra: "getTabURLs", tabbed: false});});
mapkey('ob', '#8Open a bookmark',                function() {    Front.openOmnibar(({type: "Bookmarks", tabbed: false}));});
mapkey('oh', '#8Open URL from history',          function() {    Front.openOmnibar({type: "History", tabbed: false});});
mapkey('oe', '#8Open Search with google',        function() {Front.openOmnibar({type: "SearchEngine", extra: "g", tabbed: false});});
mapkey('ou', '#8Open an URL in current tab',     function() {Front.openOmnibar({type: "URLs", extra: "getTopSites", tabbed: false});});

mapkey('oza', '#8Open an URL in dev master',function() {Front.openOmnibar({type: "History",tabbed: false, pref: "build github Dev-master "});});
mapkey('ozb', '#8Open an URL project',      function() {Front.openOmnibar({type: "History",tabbed: false, pref: "build github Dev-master "});});



mapkey('ono', '#8Open a URL in current tab (history+bookmarks)',      function() {     Front.openOmnibar({type: "URLs", extra: "getAllSites", tabbed: true });});
mapkey('onx', '#8Open recently closed URL',       function() {    Front.openOmnibar({type: "URLs", extra: "getRecentlyClosed", tabbed: true});});
mapkey('ont', '#8Open opened URL in current tab', function() {    Front.openOmnibar({type: "URLs", extra: "getTabURLs", tabbed: true});});
mapkey('onb', '#8Open a bookmark',                function() {    Front.openOmnibar(({type: "Bookmarks", tabbed: true}));});
mapkey('onh', '#8Open URL from history',          function() {    Front.openOmnibar({type: "History", tabbed: true});});
mapkey('one', '#8Open Search with google',        function() {Front.openOmnibar({type: "SearchEngine", extra: "g", tabbed: true});});
mapkey('onu', '#8Open an URL in current tab',     function() {Front.openOmnibar({type: "URLs", extra: "getTopSites", tabbed: true});});
mapkey('onz', '#8Open an URL in dev master',      function() {Front.openOmnibar({type: "History",tabbed: true, pref: "build github Dev-master "});});



// https://github.com/Genki-S/dotfiles/blob/master/miscfiles/surfingkeys.js
mapkey(',R', '#11Reload Base settings', () => {
    var filename = "";
    filename = 'https://raw.githubusercontent.com/cibinmathew/my-dotfiles/master/surfing-keys-base.js';

    RUNTIME('loadSettingsFromUrl', { url: filename});
    Front.showBanner('settings were reloaded ' + filename);
});


// https://github.com/Genki-S/dotfiles/blob/master/miscfiles/surfingkeys.js
mapkey(',r', '#11Reload My settings', () => {
    var filename = "";
    filename = "file://@home_dir@/surfing-keys.js";
    filename = 'file://<%= ENV["HOME"] %>/.surfingkeys.js';
    filename = 'https://raw.githubusercontent.com/cibinmathew/my-dotfiles/master/surfing-keys.js';
    filename = "file://@home_dir@/surfing-keys.js";
    filename = "file://C:/users/cibin/Downloads/surfing-keys.js";
    filename = "file:///home/cibin/surfing-keys.js";

    RUNTIME('loadSettingsFromUrl', {
        url: filename
    });
    Front.showBanner('settings were reloaded ' + filename);
});

// copies {{{
mapkey('yo', "#7Copy current page's URL & title in org-mode format", function() {
    Clipboard.write('[[' + window.location.href + '][' + document.title + ']]');
});

// useful for e.g. copying JIRA keys
// taken from https://github.com/kalbasit/dotfiles/blob/master/.surfingkeys.js.dtmpl
function copyLastElementInPath() {
    const locationParts = window.location.href.split('/');
    const lastElement = locationParts[locationParts.length - 1].split('#')[0].split('?')[0];
    if (!lastElement) {
        Front.showBanner(`No last element was found.`);
        return;
    }
    Clipboard.write(lastElement);
    Front.showBanner(`Copied ${lastElement} to the clipboard.`);
}
mapkey('yl', '#7Copy the last element of the path in the URL', copyLastElementInPath);

mapkey("spl", "#13Set the Proxy to custom", () => {
    // setProxy 127.0.0.1:5555;
    // setProxyMode always;
    RUNTIME("updateProxy", {
        mode: "always",
        proxy: "127.0.0.1:5555"
    });
});

mapkey('ymm', "#7Copy current page's URL as markdown", function() {
    //https://gist.github.com/utick/83297b4f15f32ffdeb61206e47390776
    Front.writeClipboard('[' + document.title + '](' + window.location.href + ')');
});

addSearchAlias('gh', 'Github Repos', 'https://github.com/search?utf8=✓&q=');

addSearchAlias('L', 'Im feeling lucky', 'https://www.google.com/search?btnI=1&q=');

//https://github.com/mindgitrwx/gitconventions/blob/master/SurfingKeys-config-ko.js
addSearchAlias('gM', '구글맵', 'https://www.google.com/maps?q=');

//
addSearchAlias('lJ', 'language Javascript', 'https://www.google.com/search?q=Javascript+');
addSearchAlias('lj', 'language java', 'https://www.google.com/search?q=Java+');
//addSearchAlias('lC', 'C++', 'https://www.google.com/search?q=C++');
addSearchAlias('lc', 'language c', 'https://www.google.com/search?q=c+language+');
addSearchAlias('l#', 'language C#', 'https://www.google.com/search?q=c%23+');
addSearchAlias('lR', 'language R', 'https://www.google.com/search?q=languag+');
addSearchAlias('lr', 'language Ruby', 'https://www.google.com/search?q=Ruby+');
addSearchAlias('lP', 'language Python', 'https://www.google.com/search?q=Python+');
addSearchAlias('lp', 'language php', 'https://www.google.com/search?q=php+');
addSearchAlias('lK', 'language Kotlin', 'https://www.google.com/search?q=Kotlin+');
addSearchAlias('lS', 'language Swift', 'https://www.google.com/search?q=Swift+');
addSearchAlias('lQ', 'language SQL Query', 'https://www.google.com/search?q=SQL+');
addSearchAlias('ls', 'language Shell script', 'https://www.google.com/search?q=Shell+Schript+');
addSearchAlias('lT', 'language Typescript', 'https://www.google.com/search?q=TypeScript+');
addSearchAlias('lH', 'language HTML', 'https://www.google.com/search?q=HTML+');

mapkey('oGg', '#8Open Search in google', function() { Front.openOmnibar({type: "SearchEngine", extra: "gh"});});



mapkey('ygG', '#7 git clone - git clone address', function() {
    Clipboard.write('git clone ' + window.location.href + '.git');
}, {
    domain: /github\.com/i
});

// goto dev-master branch
mapkey('Gfdm', 'goto dev-master', function() {
    // replace the query parameter value with new query and value
    window.location.href = window.location.href.replace(/(tbm=)[^\&]+/, '');

}); //,{domain: /google\.(co\.in|com|in)/i});

// omnibar-maps 
// cmap could be used for Omnibar to change mappings
cmap('<Ctrl-n>', '<Tab>');
cmap('<Ctrl-p>', '<Shift-Tab>');

cmap('<Ctrl-f>', '<Ctrl-.>');
cmap('<Ctrl-b>', '<Ctrl-,>');

// c examine request
mapkey('cer', '#13show failed web requests of current page', function() {
    runtime.command({
        action: 'getTabErrors'
    }, function(response) {
        if (response.tabError && response.tabError.length) {
            var errors = response.tabError.map(function(e) {
                var url = new URL(e.url);
                return "<tr><td>{0}</td><td>{1}</td><td>{2}</td></tr>".format(e.error, e.type, url.host);
            });
            Front.showPopup("<table style='width:100%'>{0}</table>".format(errors.join('')));
        } else {
            Front.showPopup("No errors from webRequest.");
        }
    });
});

mapkey('<Ctrl-F2>', 'Bookmark current page to selected folder', function() {
    var page = {
        url: window.location.href,
        title: document.title
    };
    Front.openOmnibar(({
        type: "AddBookmark",
        extra: page,
        pref: "cmla"
    }));
});


mapkey('yP', 'copy last element in url path', copyLastElementInPath);

function copyLastElementInPath() {
    // https://github.com/kalbasit/shabka/blob/master/modules/home/workstation/chromium/surfingkeys.js
    const locationParts = window.location.href.split("/");
    const lastElement = locationParts[locationParts.length - 1].split("#")[0].split("?")[0];
    if (!lastElement) {
        Front.showBanner(`No last element was found.`);
        return;
    }
    Clipboard.write(lastElement);
    Front.showBanner(`Copied ${lastElement} to the clipboard.`);
}

// alt m not working
mapkey('<Alt-t>os', 'goto', function() {
    tabOpenLink("/pages/options.html");
});

mapkey('<Alt-t>on', '#8Open fav: notes', function() {
    Front.openOmnibar({
        type: "URLs",
        extra: "getAllSites",
        pref: "Evernote all notes"
    });
});

// ZOOM (inaddition to zi,zo,zr)
map('=', 'zi');
map('<Ctrl-x>=', 'zi');
map('<Ctrl-x>+', 'zi');
map('+', 'zi');

map('<Ctrl-x>0', 'zr');
map('0', 'zr');

map('<Ctrl-x>-', 'zo');
map('-', 'zo');

function httpGet(theUrl) {
    // returns the contents of passed url
    //https://stackoverflow.com/questions/247483/http-get-request-in-javascript
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}
/////////////////////////
////     GITHUB     ////
///////////////////////

// github, h=up,i=up,u=root
// up=remove last section & if blob, replace to tree
mapkey('cgr', "#7Copy github raw contents", function() {
    //cbn gittable
    var url = window.location.href;

    url = url.replace(/\/(blob|tree)\//i, "/raw/");

    // TODO got ot tree and blob
    // url = url.replace(/\/(blob|tree)\/([^\/]+)\/.*?$/i, '/tree/$1');

    // Clipboard.write(url);
    Clipboard.write(httpGet(url));

});

function getGithubBaseUrl(url) {
    // returns base url(with user and repo name)
    //cbn gittable
    //url = url.replace(/(?:.*?)github\.com\/([^\/]+\/[^\/]+).*?$/i, '$1');
    url = url.replace(/(https?:\/\/[^\/]+)\/([^\/]+\/[^\/]+).*?$/i, '$1/$2');

    return url;

}

function getGithubBranchName(url) {
    //cbn gittable
    var reg = new RegExp(/(https?:\/\/[^\/]+)\/([^\/]+\/[^\/]+)\/(find|tree|blob)\/([^\/]+).*?$/i);
    if (url.match(reg))
        var name = url.replace(reg, '$4');

    return name || 'master'; // send default branch if not available in the url

}

mapkey('cysf', "#7 goto find file of current/default branch", function() {
    //cbn gittable
    window.location.href = getGithubBaseUrl(window.location.href) + '/find/' + getGithubBranchName(window.location.href);

});

mapkey('gPg', "#7 goto pull requests", function() {
    //cbn gittable
    window.location.href = getGithubBaseUrl(window.location.href) + '/pulls';

});

mapkey('cysc', "#7 goto settings/collaboration", function() {
    //cbn gittable
    window.location.href = getGithubBaseUrl(window.location.href) + '/settings/collaboration';
});

mapkey('cysb', "#7 goto settings/branches", function() {
    //cbn gittable
    window.location.href = getGithubBaseUrl(window.location.href) + '/settings/branches';

});

mapkey('cysn', "#7 goto settings/network", function() {
    //cbn gittable
    window.location.href = getGithubBaseUrl(window.location.href) + '/settings/network';

});

mapkey('<Ctrl-x><Ctrl-c>', '#5Save session and quit', function() {
    RUNTIME('createSession', {
        name: 'LAST',
        quitAfterSaved: true
    });
});


mapkey('cc', 'Open selected text link else link from clipboard(multiline)', function() {
    // TODO not working in google webpages
    // this functions are not modified much
    open_clipboard(0);
});
mapkey('cnc', 'Open selected text link else link from clipboard(multiline)', function() {
    open_clipboard(1);
});


function open_clipboard( newTab=0){

    Clipboard.read(function(response) {
        var text = window.getSelection().toString() || response.data;
        var lines = text.split('\n');
        if (newTab===0) // only one link can be opened in current tab
            window.location.href = lines[0];
        else 
        {
            Front.showBanner("lines(incl blanks): " + lines.length);
            if (lines.length>10)
                if (confirm("Too many lines (>10)! Total lines: " + lines.length + ". Continue?")== false)
                    return;
            for (var i = 0; i < lines.length; i++) {
                tabOpenLink(lines[i]);
            }
        } 

    });
}

// TODO gnv conflicts(using gNv for now)
mapkey('gv', 'increment number the last number in the url +1', function() {
    url_increment_number(1);
});
mapkey('gNv', 'increment number the last number in the url +1 (new Tab)', function() {
    url_increment_number(1,1);
});
mapkey('gV', 'Decrement number the last number in the url -1', function() {
    url_increment_number(-1);
});
mapkey('gNV', 'Decrement number the last number in the url -1 (new Tab)', function() {
    url_increment_number(-1,1);
});

function url_increment_number(inc=1, newTab=0) {

    // TODO retain leading zero after incrementing
    // TODO make url as an input(default=current url)
    url = window.location.href;
    url = url.replace(/(\d+?)([^\d]*)$/g, function(match, matched_number, trailingString) {
        var newNo = parseInt(matched_number) + inc;
        return newNo + "" + trailingString;
    });

    //window.location.href = url;
     open_tab(url, newTab)
}

function open_tab(dest,newTab=0, focus=0) {


     if (newTab == 0) {
            win = window.open(dest, "_self");
        } else {
            win = window.open(dest, "_blank");
            // window.location.href = url;
        }
    // other options to explore
    //  win = window.open(links[count], "_blank");
    // win = window.open(links[count], "_self");
    
    // window.open(url, '_blank').focus();
    // window.location.href = 
}

settings.cursorAtEndOfInput = true; // Whether to put cursor at end of input when entering an input box, by false to put the cursor where it was when focus was removed from the input.

settings.modeAfterYank = "Normal";

settings.theme = '\
#sk_omnibar {\
  width: 98%;\
  top: 10px;\
  left: 1%;\
}\
';

// Proxy
map('<Alt-t>spa', ':setProxyMode always', 0, '#13set proxy mode `always`');
map('<Alt-t>spb', ':setProxyMode byhost', 0, '#13set proxy mode `byhost`');
map('<Alt-t>spd', ':setProxyMode direct', 0, '#13set proxy mode `direct`');
map('<Alt-t>sps', ':setProxyMode system', 0, '#13set proxy mode `system`');
map('<Alt-t>spc', ':setProxyMode clear', 0, '#13set proxy mode `clear`');


map('`', "'");

//////////////////////////////////////////////////////
////
////         In Progress/Development              ////
////
//////////////////////////////////////////////////////


// 1. implementation approach 1

// https://github.com/brookhong/Surfingkeys/issues/1355
function toggleFullscreen() {
  let elem = document.querySelector("video");
  if (!document.fullscreenElement) {
    elem.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    });
  } else {
    document.exitFullscreen();
  }
}



// 2.  Another implementation


function openFullscreen_toggle() {
  // let elem = document.querySelector("video");
  if (!document.fullscreenElement) {
    // elem.requestFullscreen().catch(err => {
    //   alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
    // });
    openFullscreen();
  } else {
    closeFullscreen();
  }
}

/* View in fullscreen */
function openFullscreen() {
    var elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) { /* Safari */
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { /* IE11 */
    elem.msRequestFullscreen();
  }
}

/* Close fullscreen */
function closeFullscreen() {
    var elem = document.documentElement;
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) { /* Safari */
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) { /* IE11 */
    document.msExitFullscreen();
  }
}

mapkey('q', 'full screen', function() {
    openFullscreen_toggle();  // implementation 1
    // toggleFullscreen(); // implementation 1
});


function save_bookmark(number, url) {
    var dataObj = {};
    dataObj[number] = window.location.href;
    browser.storage.local.set(dataObj);    
}

function open_bookmark(number, window_loc=0) {
    var dataObj = [number];
     
    browser.storage.local.get(dataObj, function(item) {
        if (window_loc == 1) { // todo testing
            win = window.open(item[number], "_self");
        } else {
            win = window.open(item[number], "_blank");
        }
    });
}

// TODO change this
mapkey('gxaa', 'add mark', function() {   save_bookmark("1", "1");});
mapkey('gxab', 'add mark', function() {   save_bookmark("2", "1");});
mapkey('gxac', 'add mark', function() {   save_bookmark("3", "1");});

mapkey('gxoa', 'open mark', function() {   open_bookmark("1"); });
mapkey('gxob', 'open mark', function() {   open_bookmark("2"); });
mapkey('gxoc', 'open mark', function() {   open_bookmark("3"); });

map('<Ctrl-1>', 'gxoa');
map('<Ctrl-2>', 'gxob');
map('<Ctrl-4>', 'gxoc');

map('<Ctrl-!>', 'gxaa');
map('<Ctrl-@>', 'gxab');
map('<Ctrl-#$>', 'gxac');

// create 2 hks for advanced usages:
// 1. open a fixed url but by adding a suffix or increment last digit
// 2. apply script on current url.

function advanced_url_transform (url) {
    // add few samples like below to be used quickly by uncommenting
    //url = url+1
    
    return url;
}


map('<Ctrl-o>', 'E');
mapkey('<Ctrl-l>', '#4Go to last used tab', function() {  RUNTIME("goToLastTab"); });
mapkey('<Ctrl-o>', '#4Go to last used tab', function() {  RUNTIME("goToLastTab"); });
mapkey('x',        '#4Go to last used tab', function() {  RUNTIME("goToLastTab"); });
mapkey('<Alt-n>',  '#4Go to last used tab', function() {  RUNTIME("goToLastTab"); });
imapkey('<Alt-n>',  '#4Go to last used tab', function() {  RUNTIME("goToLastTab"); });

//map('cn', 'n');
mapkey('n', '#4Go to last used tab', function() {
    RUNTIME("goToLastTab");
});

mapkey('cnl', '#4Go to last used tab', function() { 
    if (tabHistory.length > 1) {
        var lastTab = tabHistory[tabHistory.length - 3];
        chrome.tabs.update(lastTab, {
            active: true
        });
    }
});
// mapkey('N', '#4Go one tab history back', function() {
//     RUNTIME("historyTab", {backward: true});
// }, {repeatIgnore: true});
// mapkey('J', '#4Go one tab history forward', function() {
//     RUNTIME("historyTab", {backward: false});
// }, {repeatIgnore: true});
// mapkey('<Ctrl-6>', '#4Go to last used tab', function() {
//     RUNTIME("goToLastTab");
// });
// mapkey('gT', '#4Go to first activated tab', function() {
//     RUNTIME("historyTab", {index: 0});
// }, {repeatIgnore: true});

// for insert mode as well
mapkey('<Ctrl-m>', '#4Go to last used tab', function() { RUNTIME("goToLastTab"); });
imapkey('<Ctrl-m>', '#4Go to last used tab', function() { RUNTIME("goToLastTab"); });
// mapkey('g;', '#4Go to last used tab', function() { RUNTIME("goToLastTab"); });
// imapkey('<Ctrl-6>', '#4Go to last used tab', function() { RUNTIME("goToLastTab"); });

// TOdo not working (overrides hotkey for Jump to vim-like mark in new tab)
// mapkey("<Ctrl-'>", '##4Go to last used tab', function(mark) { RUNTIME("goToLastTab"); });

// map space to last to last
mapkey('<Space>', 'Choose a tab with omnibar', function() {
    Front.openOmnibar({type: "Tabs"});
});

function toggleQuote() {
    // cycles through single and double quotes
    var elm = getRealEdit(), val = elm.value;
    if ( val.match( /^"|"$/ ) ) {
        elm.value = val.replace(/^"?(.*?)"?$/, "'$1'");
    } else if ( val.match( /^'|'$/ ) ) {
        elm.value = val.replace(/^'?(.*?)'?$/, '$1');
    } else {
        elm.value = '"' + val + '"';
    }
}

function toggleQuote() {
    var elm = getRealEdit(), val = elm.value;
    if ( val.match( /^"|"$/ ) ) {
        elm.value = val.replace(/^"?(.*?)"?$/, '$1');
    } else {
        elm.value = '"' + val + '"';
    }
}


function toggleQuote2() {
    // TODO 1. toggle current word, 2. if cur word is quoted, add word on the left to quoted. similarly to right as well.
    // TODO 1. if no selection, quote the word
    // 2. if already quoted, unquote the match
    var elm = getRealEdit(), val = elm.value;
    
    // TODO 
    // 1. dont add an explicit space if end of line
    // 2. set the cursor back to the old location       
    
    if (document.activeElement.selectionStart == document.activeElement.selectionEnd )
    {
        word_start = val.substring( 0, document.activeElement.selectionStart).lastIndexOf(' ');
        word_end = document.activeElement.selectionStart + val.substring( document.activeElement.selectionEnd, val.length ).search(/(\s|$)/);  // space or end as word ending
    }
    else { // there is selection
        // TODO later, if selection, retain the selection, so that toggle to unqoute can know if multiple words were selected
        word_start = document.activeElement.selectionStart-1;
        word_end = document.activeElement.selectionEnd;
    }
    prefix = val.substring(0, word_start+1);  // incl trailing space if any
    quotable = val.substring( 1+ word_start, word_end);
    suffix = val.substring( word_end);   // incl leading space
    
    if (quotable.startsWith('"')) {
        quotable = quotable.slice(1);
    }
    else
        quotable = '"' + quotable;
        
    if (quotable.endsWith('"'))
        quotable = quotable.slice(0, -1);
    else
        quotable = quotable + '"';
   
    elm.value = prefix + quotable + suffix;
    elm.setSelectionRange(1+word_start, 1+word_start + quotable.length); 
    // TODO return the cursor back to initial if no selection
}

imapkey('<Ctrl-i>', 'Choose a tab with  d', toggleQuote2);


mapkey('ozd', '#8OOpen tabs with same domain',   function() { 
    Front.openOmnibar({type: "Tabs",tabbed: true, pref:  window.location.host + " " });
});

mapkey('ozh', '#8Osearch same host',   function() { open_url_from(1, "History"); });
mapkey('ozp', '#8Osearch same parent path',   function() { open_url_from(2, "History"); });
mapkey('ozq', '#8Osearch in query params',   function() { open_url_from(3, "History"); });
    
function open_url_from(source=0, type = "History") {
    // cbn gittable
    // sources: 1. current domain 2. current dir(search only in the last section of the path)
    // 3. search in query param variations
    url=window.location.href;
    var text; 

    if (source==2) 
        text=url.replace(/([^/]*)\/?$/g, '') + " ";  // parent path
    else if ( source==1)
        text = window.location.host + " "; // current host
        // window.location.origin??
    else if (source==3)
        text=url.replace(/([^/]+?)\/?(\?.*)$/g, '$1?') + " "; // same path, search in query params
    else
        text = "";

    Front.openOmnibar({type: type,tabbed: true, pref:  text });
    
}
mapkey('gac', 'goto url with clipboard as the last dir', function() {
    goto_clipb_url_dir();
});

function goto_clipb_url_dir(inc=1) {
    // TODO arg for new tab
    // goto url with clipboard as the last dir
    var url;
    Clipboard.read(function(response) {
       url = window.location.href;
       url=url.replace(/([^/]*)\/?$/g, '') + response.data;
    });
    window.location.href = url;
}

// TODO make gnU/gnu open in new tab

mapkey('<Alt-x>', 'Open omnibar', function() {
  Front.openOmnibar({type: "Commands"});}
);

// open current url is more frequent than a new empty tab
mapkey('oni', '#open incognito window', function() {
    RUNTIME ('openIncognito');
    // RUNTIME ('openIncognito', { url: window.location.href }); // with specified url
});	


mapkey('oaa', '#1Open a link in current tab', function() { Hints.create("", Hints.dispatchMouseClick, { tabbed: false, active: false }); })


// TODO get a workaround for this(as this is useful) https://github.com/brookhong/Surfingkeys/issues/1588#issuecomment-1002820290
// Marks:
// mapkey('M', '#10Add current URL to vim-like marks', Normal.addVIMark);
// mapkey("'", '#10Jump to vim-like mark', Normal.jumpVIMark);
// mapkey("<Ctrl-'>", '#10Jump to vim-like mark in new tab.', function(mark) { Normal.jumpVIMark(mark); });

// map('m', ']]',   /google\.(co\.in|com|in)/i  ); // todo default action stopped working for other domains

// Copied from https://brookhong.github.io/2019/04/15/ctrl-p-and-ctrl-n-for-google.html
if (window.origin === "https://www.google.com") {
    function cycleGoogleSuggestions(forward) {
        var suggestions = document.querySelectorAll("ul>li.sbct");
        var selected = document.querySelector("ul>li.sbct.sbhl");
        var next;
        if (selected) {
            selected.classList.remove("sbhl");
            var next = Array.from(suggestions).indexOf(selected) + (forward ? 1 : -1);
            if (next === suggestions.length || next === -1) {
                next = {innerText: window.userInput};
            } else {
                next = suggestions[next];
                next.classList.add("sbhl");
            }
        } else {
            window.userInput = document.querySelector("input.gsfi").value;
            next = forward ? suggestions[0] : suggestions[suggestions.length - 1];
            next.classList.add("sbhl");
        }
        document.querySelector("input.gsfi").value = next.innerText;
    }
    imapkey('<Ctrl-p>', 'cycle google suggestions', function () {
        cycleGoogleSuggestions(false);
    });
    imapkey('<Ctrl-n>', 'cycle google suggestions', function () {
        cycleGoogleSuggestions(true);
    });
}


 mapkey('yc', '#7Copy a link text to the clipboard', function() { 
     Hints.create('*[href]', function(element) { 
         Clipboard.write(element.innerText); 
     }); 
 });


function getTableColumnHeadss() {
    var tds = [];
    document.querySelectorAll("a").forEach(function(t) {
        //var tr = t.querySelector("");
        var tr=t;
        // alert(tr);
        if (tr) {
            tds.push(...tr);
        }
    });
    console.log('hell');
    return tds;
    
}

// mapkey('O', '#1Open detected links from text', function() {
//     Hints.create(/(\w{7}$)/ig, function(element) {
//         window.location.assign(element[2]);
//     }, {statusLine: "Open detected links from text"});
// });


mapkey('yz', '#7Copy texts from table cols', function() {
    Hints.create(getTableColumnHeadss(), function(element) {
         console.log('hello');
        //var column = Array.from(element.closest("table").querySelectorAll("tr")).map(function(tr) {
        //    return tr.children.length > element.cellIndex ? tr.children[element.cellIndex].innerText : "";
        console.log(element)
        var column = Array.from(element).map(function(tr) {
        return tr.innerText;
        });
        Clipboard.write(column.join("\n"));
    });
});


//TODO how to insert comman and semicolon if below is enabled
// imap(',,', "<Esc>");        // press comma twice to leave current input box.
imap(';;', "<Ctrl-'>");     // press semicolon twice to toggle quote.
imap('<Ctrl-a>', "<Ctrl-f>");
imapkey('<Ctrl-k>', '#15kill-line', () => {
  let element = getRealEdit();
  if (element.setSelectionRange !== undefined) {
    element.value = element.value.substr(0, element.selectionStart);
  } else {
    // for contenteditable div
    var selection = document.getSelection();
    selection.focusNode.data = selection.focusNode.data.substr(
      selection.focusOffset
    );
  }
});

imap('<Ctrl-n>', '<ArrowDown>');
imap('<Ctrl-p>', '<ArrowUp>');

// TODO Not working after the refactoring https://github.com/brookhong/Surfingkeys/wiki/Migrate-your-settings-from-0.9.74-to-1.0
// vmap('A', '$');
// vmap('I', '0');

mapkey('<Alt-,>', '#3Move current tab to left', function() {
    RUNTIME('moveTab', {
        step: -1
    });
});

mapkey('<Alt-<>', '#3Move current tab to left', function() {
    RUNTIME('moveTab', {
        step: -99
    });
});

mapkey('<Alt-.>', '#3Move current tab to right', function() {
    RUNTIME('moveTab', {
        step: 1
    });
});

// TODO exisiting binding: 99>>??
mapkey('<Alt->>', '#3Move current tab to right', function() {
RUNTIME('moveTab', {
        step: 99
    });
});

map('gk', 'gi')
//handy for google
mapkey('gi', '#1Go to the first edit box', function() {
    Hints.create("input[type=text]:nth(0)", Hints.dispatchMouseClick);
    if(input) {
        input.click();
        input.focus();
    }
    
});

mapkey('gr', '#4Reload the page without cache', function() {     RUNTIME("reloadTab", { nocache: true }); });
// TODO move existing gr binding to something else

mapkey(',f', 'video fullscreen (youtube, tumblr, facebook)', function() {
    document.querySelector('.ytp-fullscreen-button.ytp-button'|'.vjs-fullscreen-control.vjs-control.vjs-button').click();
});
 

aceVimMap('jj', '<Esc>', 'insert');
aceVimMap('q', ':q!', 'normal');  // esc,q, :q
// j/k home/end?
// aceVimMap('l', '$', 'normal');
// aceVimMap('h', '0', 'normal');


// giji. <- open at endaceVimMap('l', '$', 'normal');


map("M",'m');
// mapkey("m", 'goto to fav vim like mark', function() { RUNTIME('jumpVIMark', { mark: 'M' }); });
mapkey('m', '#3Toggle between current tab(mark: l), mark: M & N', function() {
    // cbn gittable
    // TODO save the last used tab to 'secondlastusedtab'
    // take argument as a list of marks to be considered
    RUNTIME('getSettings', { key: 'marks' }, 
        function(response) {
            
            if (response.settings.marks['M'].url===window.location.href)
                RUNTIME('jumpVIMark', { mark: 'N' });
            else if (response.settings.marks['N'].url===window.location.href)
                // RUNTIME("goToLastTab");
                RUNTIME('jumpVIMark', { mark: 'l' });  // mark 'l' is reserved for secondlastusedtab
            else
                RUNTIME('addVIMark', {'l': {  url: window.location.href}});
                RUNTIME('jumpVIMark', { mark: 'M' });
        }
    );
});

// move tab left/right
unmap('<');
unmap('>');
mapkey('<', '#3Move current tab to left', function() { RUNTIME('moveTab', { step: -1 }); });
mapkey('>', '#3Move current tab to right', function() { RUNTIME('moveTab', { step: 1 }); });
mapkey('g<', '#3Move current tab to left', function() { RUNTIME('moveTab', { step: -100 }); });
mapkey('g>', '#3Move current tab to right', function() { RUNTIME('moveTab', { step: 100 }); });


// C-m/A-m/m:  toggle b/w mark and last tab 
// n - toggle b/w last used tab 
// M-Space - cycle last 4 used tabs(incrrement counter if last pressed key was this)
//     CLUT extension(Alt-n/m & Alt-w: goToLastTab)
// hk:: goto github infra code if existing else open infra
// hk2:: goto github infra code if existing else open any github

//Meta = command in MacOS
// System Preference>Keyboard > Input source> needs ABC and unicode hex input; else Alt combinations will not work

mapkey('<Meta-.>', '#4Switch same domain tabs', function() {
    // cbn gittable
    // var reg = new RegExp('https://github.com', 'i');
    var domain = window.location.host;
    var reg = "https://" + window.location.host + "/*"; // TODO fix: currently ending can be anything 
    console.log("url: " + reg);
    RUNTIME('getTabs', { queryInfo: {url: reg }}, response => {
        // TODO top results are always recent, but every invocation swaps top two and hence cant be used.
            if (response.tabs?.at(-1)) {
                tab = response.tabs[response.tabs.length-1];
                RUNTIME('focusTab', {
                    windowId: tab.windowId,
                    tabId: tab.id
                });
            }
        })
    }, { repeatIgnore: true });
    
    
    

// https://github.com/mindgitrwx/personal_configures/blob/master/Surfingkeys-config-ko.js#L882


// TODO:
// https://gist.github.com/coramuirgen/94ba1d587cb2093c71f6ef4f0b371069#file-surfingkeys_settings_with_vivaldi_keyboard_shortcut_precedence-js-L265

function open_nth_path_in_url(source_url, n){
    // cbn gittable

    // This opens the parent url(upto nth path parameter)
    var source_url = window.location.href;
    var pathList = source_url.split( '/' );
    var url = window.location.origin;
    for (let i = 1; i <= n; i++) {
        url += '/' + pathList[i+2];
    }
    window.location.href = url;
        
}



mapkey('gaaU', '#4Go to uptill 2nd path root of current URL hierarchy', function() {
    open_nth_path_in_url(window.location.href, 2 );
    }); 


mapkey("<Space>", "pause/resume on youtube", function() {
// https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md#examples

    var btn = document.querySelector("button.ytp-ad-overlay-close-button") || document.querySelector("button.ytp-ad-skip-button") || document.querySelector('ytd-watch-flexy button.ytp-play-button');
    btn.click();
}, {domain: /youtube.com/i});




mapkey('ou', '#8Open AWS services', function() {
// https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md#examples-19
    var services = Array.from(top.document.querySelectorAll('#awsc-services-container li[data-service-href]')).map(function(li) {
        return {
            title: li.querySelector("span.service-label").textContent,
            url: li.getAttribute('data-service-href')
        };
    });
    if (services.length === 0) {
        services = Array.from(top.document.querySelectorAll('div[data-testid="awsc-nav-service-list"] li[data-testid]>a')).map(function(a) {
            return {
                title: a.innerText,
                url: a.href
            };
        });
    }
    Front.openOmnibar({type: "UserURLs", extra: services});
}, {domain: /console.amazonaws|console.aws.amazon.com/i});



addSearchAlias('d', 'duckduckgo', 'https://unifiedsearch.amazonaws.com/search', 'c', 'https://duckduckgo.com/ac/?q=', function(response) {
    // https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md#examples-6
    var res = JSON.parse(response.text);
    return res.map(function(r){
        return r.phrase;
    });
});


addSearchAlias('d', 'duckduckgo', 'https://duckduckgo.com/?q=', 'c', 'https://duckduckgo.com/ac/?q=', function(response) {
    // https://github.com/brookhong/Surfingkeys/blob/master/docs/API.md#examples-6
    var res = JSON.parse(response.text);
    return res.map(function(r){
        return r.phrase;
    });
});

// Search for repo in current page's org
addSearchAlias('d', 'github org', 'https://github.com/?q=', 'c', 'https://duckduckgo.com/ac/?q=', function(response) {
    var res = JSON.parse(response.text);
    return res.map(function(r){
        return r.phrase;
    });
});
