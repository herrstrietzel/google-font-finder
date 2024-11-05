
let results = 0;
let fontListFiltered = fontList;
let flush = window.location.hash === '#flush' ? true : false;
let useCache = flush ? false : true;
useCache = false;

//console.log('flush', flush, useCache);
//console.log('settings', settings);
initFontList(useCache);

/*
setTimeout(()=>{
    enhanceDetails();
},1000)
*/


//init feather icons
//feather.replace();

/**
 * 
 * toggle nav
 */
let btnToggleNav = document.querySelectorAll('.btnToggleNav');

let mql = window.matchMedia("(min-width: 640px)");

if ( mql.matches ) {
    document.body.classList.replace('nav-closed', 'nav-active');
    document.body.classList.remove('nav-init');
    btnToggleNav.forEach(btn=>{
        btn.classList.add('btn-active');
    })
}

btnToggleNav.forEach(btn=>{
    btn.addEventListener('click', (e) => {
        if (document.body.classList.contains('nav-active')) {
            document.body.classList.replace('nav-active', 'nav-closed')
        } else {
            document.body.classList.replace('nav-closed', 'nav-active')
        }
    
        btnToggleNav.forEach(btn=>{
            btn.classList.toggle('btn-active');
        })
        //btn.classList.toggle('btn-active');
    })

})


async function initFontList(useCache = true) {


    //console.log('init font list');
    // reset list and filters
    ulFiltered.innerHTML = '';
    asideFilter.innerHTML = '';
    loadingSpinner.classList.remove('dsp-non')


    // init font list
    let res = await (fetch(fontList_cache_url))
    fontList = res.ok ? await (res).json() : [];
    fontListFiltered = fontList



    /**
     * render filter boxes
     */

    let checkboxesHtml = ''
    let filterInputsUrl = 'cache/fontList_filterinputs.html';
    let filterInputsRes = useCache ? await (fetch(filterInputsUrl)) : { ok: false };



    checkboxesHtml = await getFilterHTML(fontList, presetsFilter, translationsFilterInputs);

    /*
    if (filterInputsRes.ok) {
        checkboxesHtml = await filterInputsRes.text()
        //console.log('use cached filterInputsRes');
    } else {
        checkboxesHtml = await getFilterHTML(fontList, presetsFilter);

        if (hasPhp && useCache) {
            //saveJsonToServer(phpUrl, checkboxesHtml, '../cache/fontList_filterinputs.html');
        }
    }
    */
    asideFilter.insertAdjacentHTML('beforeend', checkboxesHtml)


    /**
     * render font lists
     */

    //hide loading spinner
    loadingSpinner.classList.add('dsp-non')
    let ulFilteredHTML = '';



    //let t0 = performance.now();
    let fontListCacheUrl = 'cache/fontList_cache.html';
    let fontListRes = useCache ? await (fetch(fontListCacheUrl)) : { ok: false };

    if (fontListRes.ok) {
        ulFilteredHTML = await fontListRes.text()
        //console.log('use cached');
        //console.log(fontListHtml);
    } else {
        ulFilteredHTML = renderFontList();

        //save to server
        if (hasPhp && useCache) {
            saveJsonToServer(phpUrl, ulFilteredHTML, '../cache/fontList_cache.html');
        }

    }

    // render font list
    ulFiltered.insertAdjacentHTML('beforeend', ulFilteredHTML)




    // filterListByDate(ulFiltered)
    /*
    function filterListByDate(list){
        let lis = [...list.querySelectorAll('li')];
        let date = lis[0].dataset.modified;
        let dates = lis.map(li=>{return +li.dataset.modified.split('-').join('') })
        let minDate = Math.min( ...dates );
        console.log('minDate',date,  minDate);
        //let ul = 
        
        lis.forEach(li=>{
            let date = +li.dataset.modified.split('-').join('');
            //console.log(date);
            if(date>minDate){
                li.parentNode.insertBefore(li, ulFiltered.children[lis.length] );
            }

        })
    }
    */


    //show counter
    spanResultsTotal.textContent = fontList.length;


    //init dialogs
    initDialog('#dialog');

    let dialogBtns = document.querySelectorAll("[data-dialog]");
    dialogBtns.forEach(dialogBtn => {
        dialogBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let selector = dialogBtn.dataset.dialog;
            let src = dialogBtn.dataset.dialogSrc;
            openDialog(selector, src);
        })

    })

    /**
     * populate family name filter
     */

    let optionsHtml = '';
    let datalistUrl = 'cache/fontList_datalist.html';
    let datalistRes = useCache ? await (fetch(datalistUrl)) : { ok: false };

    //console.log('useCache', useCache);

    if (datalistRes.ok) {
        optionsHtml = await datalistRes.text()
        //console.log('use cached datalist');
    } else {
        optionsHtml = '<datalist id="fontFamilyList">';
        fontList.forEach(font => {
            optionsHtml += `<option data-value="${font.family.toLowerCase().replaceAll(' ', '-')}">${font.family}</option>`;
        })
        optionsHtml += `</datalist>`;

        //save to server
        if (hasPhp && useCache) {
            saveJsonToServer(phpUrl, optionsHtml, '../cache/fontList_datalist.html');
        }
    }


    inputFontFamily.setAttribute('list', 'fontFamilyList');
    inputFontFamily.insertAdjacentHTML('afterend', optionsHtml);


    //timings
    //let t1 = performance.timeOrigin + performance.now();
    //let t2 = +((t1 - t0)).toFixed(3)
    //console.log('processed', t2);



    /**
     * init filters
     */
    let selectorInput = '.inpFilter';
    let filterInputs = document.querySelectorAll(`${selectorInput}`);

    //let filterItems = document.querySelectorAll(`[data-category]`);
    initFilter('data-category', selectorInput, results);


    // update result count
    spanResults.textContent = fontList.length
    updateResultCount('.show_filtered', selectorInput, spanResults);


    /**
     * reset all filters
     */
    btnResetFilter.addEventListener('click', e => {
        let selectorInput = '.inpFilter';
        resetFilters(selectorInput)
    })


    filterInputs.forEach(input => {
        //update filter object
        input.addEventListener('input', e => {
            filterArr = getCurrentFilters(filterInputs)
            settings.filters = filterArr;
            saveSettings(storageName, settings)
        })
    })

    /**
     * add fav btns
     */
    initFavBtns();


    /**
     * sync with local cache
    */
    //console.log('filterCache', filterCache);
    setFilterInputs(filterCache)
    // trigger update
    filterInputs[0].dispatchEvent(new Event('input'));


    // toggle init status
    toggleInitDisplay();

    settings.visited = true;
    saveSettings(storageName, settings)
    //document.body.classList.replace('init', 'loaded');

}



function setFilterInputs(filterCache = []) {
    filterCache.forEach(sel => {
        let family = sel.includes('family_') ? sel.split('cat_family_').splice(-1)[0] : '';
        let input = document.querySelector(`[data-filtervalue=${sel}]`)

        if (!input) return false;

        if (family) {
            input = inputFontFamily;
            input.value = family.replaceAll('-', ' ')

        } else {
            input.checked = true
        }
    })
}


function saveFilterPresets(filterArr) {
    //let filterArr = getCurrentFilters(filterInputs)
    settings.filters = filterArr;
    saveSettings(storageName, settings)

}



function resetFilters(selectorInput) {
    let filterInputs = document.querySelectorAll(selectorInput);

    filterInputs.forEach(input => {
        //update filter object
        if (input.type === 'checkbox' || input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    })

    filterInputs[0].dispatchEvent(new Event('input'));
    resetSettings(storageName, settings, 'filters')
    settingsToUrl(settings);

}


function updateResultCount(selectorItem, selectorInput, target) {
    let filterInputs = document.querySelectorAll(selectorInput);

    filterInputs.forEach(input => {
        //update filter object
        input.addEventListener('input', e => {
            let filtered = document.querySelectorAll(selectorItem).length;
            target.textContent = filtered
        })
    })
}




function renderFontList() {
    // render font list
    let ulFilteredHTML = '';
    fontListFiltered.forEach((item, i) => {
        let { family, files_static_woff2,
            files_vf_woff2,
            files_static_ttf,
            files_vf_ttf, menu } = item;


        let startingLetter = family.substring(0, 1).toLowerCase();
        // get preview img
        let familyUrlName = family.toLowerCase().replaceAll(' ', '-');
        let previewUrl = `https://herrstrietzel.github.io/google-fontname-preview/preview_images/sprites/${startingLetter}.svg#${familyUrlName}`;
        let previewImg = `<img src="${previewUrl}">`;

        //let useHref = `img/fontPreviews/a.svg#abeezee`;
        let useHref = `img/fontPreviews/${startingLetter}.svg#${familyUrlName}`;
        //img/fontPreviews/${startingLetter}.svg#${familyUrlName}
        // svg preview
        previewImg = `
        <svg class="svg-preview dsp-inl-blc ovr-flw-vsb" height="1.5rem" viewBox="0 200 5000 500">
            <title>${family}</title>
            <use href="${useHref}" />
        </svg>`;


        previewImg =
            `<img  src="${useHref}" class="--svg-preview img-font-preview" title="${family}" alt="${family}" loading="lazy">`;


        //let fontLink = `https://fonts.google.com/specimen/${family.replaceAll(' ', '+')}`;
        let catsFilters = [];

        let propInfo = '';
        for (let prop in item) {

            if (excludedProps.includes(prop)) continue;
            let valArr = Array.isArray(item[prop]) ? item[prop] : [item[prop]];
            let vals = Array.isArray(item[prop]) ? item[prop].join(', ') : item[prop];


            if (vals.length) {
                propInfo += `<strong>${prop}:</strong> ${vals} <br>`
                valArr.forEach(val => {
                    catsFilters.push(`cat_${prop}_${val}`);
                })
            }
        }

        let cats = catsFilters.join(', ');
        let familyFilter = 'cat_family_' + family.toLowerCase().replaceAll(' ', '-');

        let fileList = '';
        let fileFormats = {
            'woff2 variable': files_vf_woff2,
            'truetype variable': files_vf_ttf,
            'woff2 static': files_static_woff2,
            'truetype static': files_static_ttf,
        };

        fileList += `<p class="font-files mrg-0"><strong>menu:</strong> <a href="${menu}">(only font name subset)</a></p>`;
        for (files in fileFormats) {

            fileList += `
                <p class="font-files mrg-0"> <strong>${files}:</strong> `;
            for (variant in fileFormats[files]) {
                fileList += `<a href="${fileFormats[files][variant]}">${variant}</a> `
            }
            fileList += `
                </p>`;
        }


        let isVariable = item.axesNames.length ? true : false;
        let labelVF = isVariable ? '<span class="label-type labelVF" title="is variable font">VF</span>' : '';
        //labelVF = ''+item.lastModified;
        labelVF += ' <span class="label-type labelStatic">ST</span>';
        let btnFav = `<button class="btn-fav" data-fav="${family}" title="Add to favorites">
        <svg viewBox="0 0 114 100" class="icn-svg icn-heart  "><use href="#icn-heart" class="icn-fav"></use></svg></button>`;

        let familyUrl = family.replaceAll(' ', '+');

        ulFilteredHTML +=
            `<li class="font-item" 
            data-index="${i}" 
            data-family="${item.family}" 
            data-modified="${item.dateAdded}" 
            data-category="${familyFilter}, ${cats}">
                <div class="font-item-preview-wrp dsp-flx alg-itm-flx-end  mrg-1-5em mrg-top">
                    <a href="font/?family=${familyUrl}" class="a-fontkit --btn-fontkit" data-dialog="#dialog" data-dialog-src="font/?family=${familyUrl}" >
                        ${previewImg} 
                    </a>
                    <span class="label-wrp">${labelVF} &nbsp; ${btnFav}</span>
                </div>
            </li>`

    })

    return ulFilteredHTML;


}




async function getFilterHTML(fontList, presets = [], translations = {}, filterClassCache = []) {

    let fontListAllprops = await getFilteredGoogleFonts(fontList);
    let props = getAllFontProperties(fontListAllprops);
    //console.log(props);

    // update filter obj
    filter = getFilterObj(props)

    // define radio boxes
    let radios = ['category'];
    let checkboxesHtml = renderFilterBoxes(props, radios, presets, translations, filterClassCache)
    return checkboxesHtml

}



function renderFilterBoxes(props, radios = ['category'], presets = [], translations = {}, filterClassCache = []) {

    let checkboxesHtml = '';
    let openAtt = '';

    for (let prop in props) {
        let vals = props[prop]

        //console.log('vals', vals);

        // exclude props
        //if (excludedProps.includes(prop)) continue;
        if (!filterProps.includes(prop)) continue;
        openAtt = presets.includes(prop) ? 'open' : '';

        // sort values alphanumerically
        vals = [
            vals.filter(val => val.toLowerCase() === val && isNaN(val.substring(0, 1))).sort(
                (a, b) => {
                    return a > b ? 1 : -1;
                }),
            vals.filter(val => val.substring(0, 1).toUpperCase() === val.substring(0, 1)).sort(
                (a, b) => {
                    return a > b ? 1 : -1;
                })
        ].flat();

        let propLabel = translations[prop] || prop;

        checkboxesHtml +=
            `<details ${openAtt}>
        <summary>${propLabel}</summary><p class="inpWrp">`;


        let type = radios.includes(prop) ? 'radio' : 'checkbox';

        //filterClassCache

        vals.forEach(val => {
            let className = `cat_${prop}_${val}`;

            let selected = filterClassCache.includes(className) ? true : false;
            let checked = selected && (type === 'radio' || type === 'checkbox') ? 'checked' : '';


            checkboxesHtml +=
                `<label class="label-filter dsp-inl-blc">
                <input class="inpFilter" type="${type}" data-filtervalue="${className}" name="${prop}" ${checked}> ${val}</label> `
        })

        // reset to all
        if (type === 'radio') {
            checkboxesHtml +=
                `<label class="label-filter dsp-inl-blc">
                    <input class="inpFilter" type="radio" data-filtervalue="" name="${prop}"> all</label> `
        }

        checkboxesHtml += `</p></details>`;
    }

    return checkboxesHtml;
}





function getFilterObj(props) {
    let filter = {}
    for (let prop in props) {
        if (!filter[prop]) {
            filter[prop] = [];
        }
    }
    return filter;
}



function getAllFontProperties(fontListAllprops) {

    // set order for UI 
    let props = {
        family: [],
        category: [],
        variants: [],
        axesNames: [],
        features: [],
        subsets: [],
        colorCapabilities: [],
    }

    fontListAllprops.forEach(font => {
        for (let prop in font) {

            if (!filterProps.includes(prop)) continue;

            let vals = font[prop];

            if (prop === 'family') {
                vals = [vals.toLowerCase().replaceAll(' ', '-')];
            };

            if (!props[prop]) {
                props[prop] = []
            }

            if (Array.isArray(vals)) {
                vals.forEach(val => {
                    if (!props[prop].includes(val)) {
                        props[prop].push(val)
                    }
                })

            } else {
                if (!props[prop].includes(vals)) {
                    props[prop].push(vals)
                }
            }
        }
    })

    //console.log('props all', props);
    return props
}




