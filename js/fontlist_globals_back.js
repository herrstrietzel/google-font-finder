
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
        darkmode: false,
        confirmAccess: false
    }

let excludedParams = ['darkmode', 'confirmAccess'];


/**
 * get settings from url
 */
decodeURlToSettings();


/*
let settingsTest = {
    filters:["cat_family_open-sans"]
}
let testQuery = settingsToUrl(settingsTest)
console.log('testQuery', testQuery);
*/


//let filterArrCacheName = 'fontPropertyFilter';
//let filterArrCache = settings.filters;
let filterCache = settings.filters;


function saveSettings(storageName, settings) {
    localStorage.setItem(storageName, JSON.stringify(settings))

    /**
     * filters to url
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
    console.log('params', params);

    if (!Object.keys(params).length) return false;

    //let filterProps = ['axesNames', 'category', 'family', 'variants'];
    let settingProps = ['favs', 'darkmode'];

    let filterArr = [];
    for (let prop in params) {
        let item = params[prop];

        if (!settingProps.includes(prop)) {
            let filterCats = [item.split(',')].flat().map(val => { return `cat_${prop}_${val.toLowerCase().replace(/[ |+]/gi,'-' )}` });
            filterArr.push(...filterCats)
            console.log('filterArr', filterArr);
        }

    }

    //filterArr = filterArr.flat()
    settings.filters = filterArr;
    settings.favs = params.favs ? params.favs.split(',') : settings.favs;
    settings.darkmode = params.darkmode ? JSON.parse(params.darkmode) : settings.darkmode;


    if (allUrlQueries.length && !allSettings.length) {
    }
    //console.log('get settings from url', settings);

    saveSettings(storageName, settings);

}


function settingsToUrl(settings) {

    let queryObj = {};
    let queryUrl = '';

    console.log('settings', settings)

    //console.log('update settings to url');
    for (prop in settings) {
        if (prop !== 'apiKey' && prop !== 'visited' && prop!=='darkmode' && prop!=='confirmAccess') {
            let vals = [...settings[prop]];

            if (prop === 'filters') {
                vals.forEach(val => {
                    let valArr = val.split('_');
                    let subProp = valArr[1];
                    let value = valArr[2];

                    if (!queryObj[subProp]) {
                        queryObj[subProp] = []
                    }

                    if(subProp==='family'){
                        value = value.split('-').map(val=>{
                            return val.substring(0,1).toUpperCase()+val.substring(1)
                        }).join('+')

                        console.log('family:', value);
                    }
                    queryObj[subProp].push(value)
                })

            } 
            

            else {
                //add value array
                if (!queryObj[prop]) {
                    queryObj[prop] = []
                }
                //queryObj[prop] = vals.map(val => { return val.toString().replaceAll(' ', '+') })
                queryObj[prop].push(...vals)

                console.log('not fav', queryObj[prop], prop);

            }
        }
    }

    console.log('query', queryObj);

    let operator = '?';
    for (prop in queryObj) {
        let values = [queryObj[prop]].flat();
        //let operator = prop === firstProp ? '?' : '&';
        if (values.length) {
            queryUrl += `${operator}${prop}=${values.join(',')}`
            operator = '&';
        }

    }

    //update url
    queryUrl = queryUrl ? queryUrl : window.location.origin + window.location.pathname;
    window.history.replaceState({ path: queryUrl }, '', queryUrl);

    console.log('queryUrl', queryUrl);
    return queryUrl;

}


function renderAccessConfirmCheckbox(target){

    let checkMarkup=
    `<div class="input-wrap mrg-1em mrg-btt">
    <h3>Privacy settings</h3>
    <p>Some functions like fontkit creation and font preview require access to google servers</<br>Your settings will be saved in local storage</p>
    <label><input id="inputConfirmAccess" name="apiAccess" type="checkbox" value="true"> Allow loading data from google servers</label>
    </div>`;

    if(target) target.insertAdjacentHTML('beforeend', checkMarkup)

}

let detailsPrivacy = document.getElementById('detailsPrivacy')
let mainItem = document.getElementById('mainItem')

let confirmAccessWrap = document.getElementById('confirmAccessWrap')
renderAccessConfirmCheckbox(confirmAccessWrap);
let inputConfirmAccess = document.getElementById('inputConfirmAccess')
bindConfirmInput(inputConfirmAccess)


function bindConfirmInput(inp){
    if(inp){

        if(detailsPrivacy && !settings.confirmAccess){
            detailsPrivacy.open = true
        }

        //hide in item view if confirmed
        if(mainItem && settings.confirmAccess){
            confirmAccessWrap.classList.add('dsp-non')
        }

        inp.checked = settings.confirmAccess;
        inp.addEventListener('click', e=>{
            settings.confirmAccess = e.currentTarget.checked
            //console.log(settings);
            saveSettings(storageName, settings)
            if(mainItem){
                window.location.reload();

            }
        })
    }


}
//ulFiltered