
// save to server script
let phpUrl = 'php/save_json.php';
let hasPhp = false;
let useProxy = false;
//proxy url if php is available
let proxyUrl = window.location.href.split('/').slice(0, -1).join('/') + '/php/proxy/';


(async () => {
    let testPhp = await (await fetch(phpUrl)).text();
    hasPhp = testPhp === 'php available';
    useProxy = hasPhp ? true : false;
    //console.log(hasPhp, useProxy, proxyUrl);
})();



// use cached version or API request
let fontList_cache_url = 'cache/fontList_merged.json';
let fontList = [], filter;


// exclude for font list
let excludedProps = ['family', 'kind', 'menu', 'index', 'axes'];

// include for filters
let filterProps = [
    'category',
    'axesNames',
    //'family',
    'features',
    'variants',
    'colorCapabilities',
    'subsets'
];

// filter presets: opened by default
let presetsFilter = ['category', 'variants'];





// get settings from localstorage
let storageName = 'gff_settings';
let settingsStorage = localStorage.getItem(storageName)
let settings = settingsStorage ?
    JSON.parse(settingsStorage) :
    {
        favs: [],
        filters: [],
        visited: false,
        apiKey: '',
        darkmode: false
    }


/**
 * get settings from url
 */
decodeURlToSettings();


//let filterArrCacheName = 'fontPropertyFilter';
//let filterArrCache = settings.filters;
let filterCache = settings.filters;


function saveSettings(storageName, settings) {
    localStorage.setItem(storageName, JSON.stringify(settings))

    /**
     * save filters to cache
     */
    //let settingUrl = settingsToUrl(settings);

}


function resetSettings(storageName, settings = {}, prop = '') {
    if (settings, prop) {
        settings[prop] = []
        localStorage.setItem(storageName, JSON.stringify(settings))
    } else {
        localStorage.removeItem(storageName)
    }
}


function getSettings(storageName) {
    return JSON.parse(localStorage.getItem(storageName))
}


function toggleInitDisplay(sel = '.dynamic-content') {
    let dynEls = document.querySelectorAll(sel);
    dynEls.forEach(el => {
        el.classList.replace('dynamic-content-init', 'dynamic-content-loaded');
    })
}


/**
 * settings to url
 */

function decodeURlToSettings() {
    //let url = window.location
    let query = new URLSearchParams(window.location.search)
    let params = Object.fromEntries(query.entries());

    let allSettings = Object.values(settings).flat();
    let allUrlQueries = Object.values(params).flat();
    //console.log(allUrlQueries, allSettings);

    if (!Object.keys(params).length) return false;

    //let filterProps = ['axesNames', 'category', 'family', 'variants'];
    let settingProps = ['favs', 'darkmode'];

    let filterArr = [];
    for (let prop in params) {
        let item = params[prop];

        if (!settingProps.includes(prop)) {
            let filterCats = [item.split(',')].flat().map(val => { return `cat_${prop}_${val.replaceAll(' ','-')}` });
            filterArr.push(...filterCats)
        } 

    }

    //filterArr = filterArr.flat()
    settings.filters = filterArr;
    settings.favs = params.favs ? params.favs.split(',') : settings.favs;
    settings.darkmode = params.darkmode ? JSON.parse(params.darkmode) : settings.darkmode;

    /*
    if(allUrlQueries.length && !allSettings.length){
        console.log('get settings from url');
        saveSettings(storageName, settings);
    }
    */

}

function settingsToUrl(settings) {

    let queryObj = {};
    let queryUrl = '';
    for (prop in settings) {
        if (prop !== 'apiKey' && prop !== 'visited') {
            let vals = [settings[prop]].flat();

            if (prop === 'filters') {
                vals.forEach(val => {
                    let valArr = val.split('_');
                    let subProp = valArr[1];
                    let value = valArr[2];

                    if (!queryObj[subProp]) {
                        queryObj[subProp] = []
                    }
                    queryObj[subProp].push(value)
                })

            } else {
                if (!queryObj[prop]) {
                    queryObj[prop] = vals.map(val => { return val.toString().replaceAll(' ', '+') })
                }
            }
        }
    }


    let firstProp = Object.keys(queryObj)[0]
    for (prop in queryObj) {
        let values = [queryObj[prop]].flat();
        let operator = prop === firstProp ? '?' : '&';
        queryUrl += `${operator}${prop}=${values.join(',')}`

    }

    //update url
    //window.history.replaceState({ path: queryUrl }, '', queryUrl);
    return queryUrl;

}