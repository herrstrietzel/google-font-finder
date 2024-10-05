// init UI
(async () => {

    // cache exists?
    let res = await (fetch(fontList_cache_url))
    fontList = res.ok ? await (res).json() : [];

    // get item by index number or name
    let familyQuery = new URLSearchParams(window.location.search).get('family') || '';

    /*
    let hash = window.location.hash;
    let index = hash ? hash.substring(1) : 0;
    let fontName = isNaN(index) ? index.replaceAll('+', ' ') : '';
    */

    let fontName = familyQuery.replaceAll('+', ' ');
    //console.log('hash', hash, familyQuery , index, fontName)

    let item = fontList.filter(item => { return item.family === fontName })[0];
    let { family, axes, subsets, variants, files_vf_woff2, files_static_woff2, files_vf_ttf, files_static_ttf, menu, designers, dateAdded, lastModified } = item;

    /**
     * get info
     */

    let designerInfo = item.designers ? designers.join(', ') : '';
    spanType.textContent = item.axesNames.length ? 'VF' : '';

    //icons
    let iconDesigners = `<svg viewBox="0 0 85 100" class="icn-svg icn-user "><use href="#icn-user" /></svg>`;
    //let iconFiles = `<svg viewBox="0 0 71 100" class="icn-svg icn-file "><use href="#icn-file"/></svg>`;
    //let iconlink = `<svg viewBox="0 0 87 100" class="icn-svg icn-link "><use href="#icn-link"></use></svg>`;

    spanDesigners.innerHTML = designerInfo ? `${iconDesigners} ${designerInfo}` : '';

    let googleLink = `https://fonts.google.com/specimen/${family.replaceAll(' ', '+')}`;
    specimenLink.href = googleLink;
    specimenLabel.textContent = 'Google specimen page: ' + item.family;


    let infoText = '';
    let propInfo = '';
    //console.log(item);

    for (let prop in item) {

        if (excludedProps.includes(prop)) continue;
        let vals = Array.isArray(item[prop]) ? item[prop].join(', ') : item[prop];

        if (vals.length || !isNaN(vals)) {
            propInfo += `<strong>${prop}:</strong> ${vals} <br>`

        }
    }

    infoText += propInfo;


    // add file links
    let fileFormats = {
        'woff2 variable': files_vf_woff2,
        'truetype variable': files_vf_ttf,
        'woff2 static': files_static_woff2,
        'truetype static': files_static_ttf,
    };


    let filelinks = '';
    filelinks += `<p class="font-files mrg-0"><strong>menu:</strong> <a href="${menu}">(only font name subset)</a></p>`;
    for (files in fileFormats) {

        filelinks += `
            <li class="font-files mrg-0"><strong>${files}:</strong> `;
        for (variant in fileFormats[files]) {
            filelinks += `<a href="${fileFormats[files][variant]}">${variant}</a> `
        }
        filelinks += `
            </li>`;
    }

    ulFileLinks.insertAdjacentHTML('beforeend', filelinks)
    sectionFontInfo.insertAdjacentHTML('beforeend', infoText)



    /**
     * update fav
     */
    btnFav.setAttribute('data-fav', item.family);
    initFavBtns();

    //render title
    h1Title.textContent = family;


    // only static or VF?
    let variantsStatic = Object.keys(files_static_woff2).map(variant => { return variant === 'italic' ? '400italic' : (variant === 'regular' ? '400' : variant) }).sort();
    //console.log('variantsStatic', variantsStatic);

    let weightsStatic = variantsStatic.map(variant => { return variant.replace(/italic/g, '').replace(/regular/g, '400') }).filter(Boolean).map(Number);

    //deduplicate
    weightsStatic = [...new Set(weightsStatic)].sort();

    let hasVF = item.axesNames.length ? true : false;
    if (!hasVF) document.body.classList.add('hide-vf')
    let hasItalics = item.variants.join(' ').includes('italic');
    let hasRegular = item.variants.join(' ').includes('regular');
    let styleArr = [(hasItalics ? 'italic' : ''), (hasRegular ? 'regular' : '')].filter(Boolean);
    //console.log(styleArr, hasItalics,item);


    // sort axes alphabetically - case sensitive ([a-z],[A-Z])
    let axesSorted = axes ? [axes.filter(item => item.tag.toLowerCase() === item.tag), axes.filter(item => item.tag.toUpperCase() === item.tag)].flat().map(item => { return item.tag }) : []

    //console.log(axes, axesSorted);

    let properties = {
        family: family.replaceAll(' ', '+'),
        axesNames: axesSorted,
        styles: styleArr,
        variants: variantsStatic,
        axes: axes,
        textSubset: '',
        display: ['swap', 'block', 'optional', 'auto', 'fallback'],
        subsets: item.subsets,
        directory: '../fonts/' + family.replaceAll(' ', '-') + '/'
    }

    /**
     * filter for url query
     */
    let filter = {}

    // preselection/defaults
    let presets = {
        axesNames: ['wght'],
        styles: ['regular', 'italic'],
        variants: ['400', '400italic', '700', '700italic'],
        display: ['swap'],
        subsets: ['latin']
    };


    let exclude = ['family', 'axes']
    let radios = ['display'];

    /**
     * render filter inputs
     */

    let filterPropArr = ['styles', 'subsets', 'directory', 'display', 'textSubset', 'axesNames', 'variants'];
    for (let i = 0; i < filterPropArr.length; i++) {
        let prop = filterPropArr[i];
        let filterInputHtml = getfilterInputsFromObj({ [prop]: properties[prop] }, radios, presets, exclude, false);
        let propNameCap = prop.substring(0, 1).toUpperCase() + prop.substring(1)

        //let propNameCap = prop;
        let targetId = `section${propNameCap}`;
        let el = document.getElementById(targetId)
        el.insertAdjacentHTML('beforeend', filterInputHtml);
    }

    /**
     * unfiltered CSS result
     * all variants/styles and subsets/languages
     * retrieve unchanged CSS result
     */
    let queryURLComplete = generateGoogleFontAPIUrl(properties);

    //"http://localhost/____stackoverflow/fonts-get-features2/php/proxy/?family=Open+Sans:ital,wdth,wght@1,75..100,300..800&display=swap"

    //use proxy
    if (useProxy) {
        queryURLComplete.variable = googleToProxyUrl(queryURLComplete.variable, proxyUrl);
        queryURLComplete.static = googleToProxyUrl(queryURLComplete.static, proxyUrl);
    }


    // display google query URLs
    aCSS_vf_unfiltered.href = proxyToGoogleUrl(queryURLComplete.variable, proxyUrl)
    aCSS_vf_unfiltered.textContent = aCSS_vf_unfiltered.href
    aCSS_static_unfiltered.href = proxyToGoogleUrl(queryURLComplete.static, proxyUrl);
    aCSS_static_unfiltered.textContent = aCSS_static_unfiltered.href;


    // init CSS parsing - unfiltered
    let subsetsStatic = await getCSSSubsetArr(queryURLComplete.static);
    let cssStatic_obj_unfiltered = getNewCSS(subsetsStatic, {}, false);
    let subsetsVF = await getCSSSubsetArr(queryURLComplete.variable);
    let cssVF_obj_unfiltered = getNewCSS(subsetsVF, {}, false);


    //render filters
    let filterInputs = document.querySelectorAll('.inpFilter');

    /**
     * collect export data
     * including CSS
     * and font file URLS
     */


    filter = getCurrentFilterObject(filterInputs);
    let cssData = await getFilteredFontData(properties, filter, useProxy);

    let fontExportData = {
        variable: cssData.variable,
        variable_unsubset: [],
        static: cssData.static,
        static_unsubset: [],
    };


    /**
     * get unsubset files
     */
    //let files_unsubset = {};
    for (let prop in item) {
        if (prop.includes('files_')) {
            let fileObj = item[prop];
            let type = prop.includes('static') ? 'static' : 'variable';
            let ext = prop.includes('woff2') ? 'woff2' : 'ttf';
            for (let variant in fileObj) {
                let file = fileObj[variant];
                let filenameNew = item.family.replaceAll(' ', '-') + `_${type}_${variant}.${ext}`
                //files_unsubset[`${type}_${ext}`].push([file, filenameNew])
                let key = type === 'variable' ? 'variable_unsubset' : 'static_unsubset';
                fontExportData[key].push([file, filenameNew]);
            }
        }
    }


    /**
     * generate zip
     */
    let fontFamily = family;
    let dir = document.querySelector('[name=directory]').value;


    /**
     * generate zip download btn
     */

    //VF files
    if (item.axesNames.length) {
        generateDownloadBtn('btnCreateFontkit_Vf', 'sectionBtns', 'variable', ['Get VF fontkit', 'loading ...', 'Download VF fonkit']);
    }
    generateDownloadBtn('btnCreateFontkit_Static', 'sectionBtns', 'static', ['Get static fontkit', 'loading ...', 'Download static fonkit']);

    // unsubset/complete font files
    if (item.axesNames.length) {
        generateDownloadBtn('btnCreateFontkit_Vf_unsubset', 'sectionBtns', 'variable_unsubset', ['Get VF fontkit (all languages, features)', 'loading ...', 'Download VF fonkit (unsubset)']);
    }
    generateDownloadBtn('btnCreateFontkit_Static_unsubset', 'sectionBtns', 'static_unsubset', ['Get static fontkit (all languages, features)', 'loading ...', 'Download static fonkit']);




    let btnsZip = document.querySelectorAll('.btn-download-zip');

    btnsZip.forEach(btnZip => {
        btnZip.addEventListener('click', async (e) => {
            let btn = e.currentTarget;
            let prop = btn.dataset.prop;
            let data = fontExportData[prop];
            //console.log(data);

            let linkDownload = btn.nextElementSibling;
            let state = btn.dataset.state;

            if (Array.isArray(data)) {
                let dataObj = { files: [] };
                dataObj.files = data.map(val => { return { orig: val[0], local: val[1] } })
                data = dataObj
            }

            //console.log(data, prop);
            //console.log('dir', dir);
            // start loading
            if (state === 'init') {
                state = setBtnState(btn, 'loading')
                let css = data.css ? data.css : '';
                await zipFontKit(data.files, fontFamily, css, linkDownload, dir);
                state = setBtnState(btn, 'ready')
            }

            if (state === 'ready') {
                linkDownload.click()
            }
        })
    })


    /**
      * update font kits
      * according to filters
      */
    filterInputs.forEach(inp => {
        inp.addEventListener('input', async (e) => {

            // update font kit
            filter = getCurrentFilterObject(filterInputs);
            let cssData = await getFilteredFontData(properties, filter, useProxy)
            dir = document.querySelector('[name=directory]').value;


            // update export data object
            fontExportData.static = cssData.static;
            fontExportData.variable = cssData.variable;

            // reset btn state
            btnsZip.forEach(btnZip => {
                //btnZip.setAttribute('data-state', 'init');
                setBtnState(btnZip, 'init')
            });

        })
    })



    /**
     * create preview
     */
    let previewText = inputPreviewText.value;
    //console.log(cssVF_obj_unfiltered.css);


    let CSSVF = cssVF_obj_unfiltered.css.replaceAll(item.family, item.family + ' VF');
    stylePrevVF.textContent = `
    #previewVF{
    font-family:${item.family + ' VF'}; 
    }
    ${CSSVF}
    `;
    //console.log(stylePrevVF);

    // add style
    let CSSStatic = cssStatic_obj_unfiltered.css;
    stylePrevStatic.textContent = `${CSSStatic}`;
    //let hasItalics = item.variants.includes('italic');
    //console.log('hasItalics', hasItalics);

    //VF
    //console.log(item);
    if (item.axesNames.length) {
        previewVF.innerHTML = `${previewText}`;
        if (hasItalics) previewVF.innerHTML += ` <em>${previewText}</em>`;
        renderAxisSliders(item, settingsVF, previewVF);
    }

    // static
    renderPreviewStatic(item, previewStatic, previewText);

    inputFontSize.addEventListener('input', e => {
        previewVF.style.fontSize = +inputFontSize.value + 'px';
        previewStatic.style.fontSize = +inputFontSize.value + 'px';
    });


    // update text
    inputPreviewText.addEventListener('input', e => {
        previewText = inputPreviewText.value;

        if (item.axesNames.length) {
            previewVF.innerHTML = `${previewText}`;
            if (hasItalics) previewVF.innerHTML += ` <em>${previewText}</em>`;

        }
        renderPreviewStatic(item, previewStatic, previewText);
    })



    /**
     * render axes sliders
     */

    function renderAxisSliders(item, targetSettings, targetPreview) {

        let { axes } = item;
        let sliders = '';
        axes.forEach(axis => {
            console.log(axis);
            sliders += `<label>${axis.tag} <input class="axis-slider" type="range" data-axis="${axis.tag}" min="${axis.start}" max="${axis.end}" value="${axis.default}"> <span class="axesValues fnt-wgh-400">${axis.start}–${axis.end} | <span class="axesVal">${axis.default}</span></span> </label>`
        });

        targetSettings.insertAdjacentHTML('beforeend', '<div class="slider-wrp">' + sliders + '</div>');
        let axisSliders = targetSettings.querySelectorAll('.axis-slider');
        let variationObj = {};

        //targetPreview.style.fontFamily = item.family;
        axisSliders.forEach(slider => {
            slider.addEventListener("input", (e) => {
                updateVariations(e.currentTarget, targetPreview, variationObj);
            });
        })
    }

    /**
     * update variable 
     * font preview
     * apply to sliders
     */
    function updateVariations(slider, targetEl, variationObj) {
        // get axes and values of current element
        let value = slider.value;
        let axis = slider.dataset.axis;
        variationObj[axis] = value;

        // convert object to array
        let variation = Object.keys(variationObj).map((key) =>
            [`'${key}'`, +variationObj[key]].join(' ')
        );
        //console.log(variation);
        targetEl.style["font-variation-settings"] = variation.join(",");
        let currentVal = slider.parentNode.querySelector('.axesVal');
        currentVal.textContent = value;
    }




    /**
     * render Static preview
     */

    function renderPreviewStatic(font, target = '', text = 'Hamburglefons', filter = {},) {

        let preview = `<article id="articlePrev" class="articlePrev" style="font-family:${font.family}; font-size:inherit;" >`;

        let variantsStatic = Object.keys(item.files_static_woff2);
        //console.log(variantsStatic, cssData);

        let axes = font.axes;
        //console.log('axes', axes);
        let stylesStatic = variantsStatic.map(style => {
            return style === 'italic' ?
                style.replaceAll('italic', '400italic') :
                (style === 'regular' ? style.replaceAll('regular', '400') : style)
        });

        let weightsStatic = [... new Set(stylesStatic.map(style => { return parseFloat(style) }))].sort();
        let hasItalics = stylesStatic.join(' ').includes('italic');


        // static preview
        for (let i = 0; i < weightsStatic.length; i++) {

            let sample = text;
            let weight = weightsStatic[i];
            let sampleHTML = hasItalics ? `<span>${sample}</span> <em>${text}</em>` : `<span>${sample}</span>`;
            //console.log(weight);

            sampleHTML += ` <small style="font-family: sans-serif; font-size:0.75rem; font-weight:400; display:inline-block;">${family} ${weight}</small>`;

            preview +=
                `<p class="p-preview p-vf" style="font-weight:${weight}; margin:0;">
                ${sampleHTML}
            </p>`;
        }

        preview += `</article>`;

        // render
        target.innerHTML = preview;

    }




    function generateDownloadBtn(id = '', target = '', data = '', labels = []) {

        let iconFile = `<svg viewBox="0 0 71 100" class="icn-svg icn-file "><use href="#icn-file" /></svg>`
        let label = labels[0];
        let isVF = data.includes('variable');
        let vfClass = isVF ? 'vf' : '';
        let btnHTML = `
<button id="${id}" class="dsp-blc txt-cnt wdt-100 bck-neg brd-rad btn-default btn-download-zip init ${vfClass}" data-state="init" data-labels="${labels.join('| ')}" data-prop="${data}">
${iconFile} 
<span class="btnLabel">${label}</span>
<span data-id="loadingSpinner" class="loadingSpinner loading dsp-inl-blc dsp-non"></span>
</button>
<a href="" id="link${id}" class="linkDownload btn-default btn-download dsp-non"></a>
`;


        let targetEl = document.getElementById(target)
        targetEl.insertAdjacentHTML('beforeend', btnHTML);
        let btn = document.getElementById(id);

        return btn;

    }


    /**
     * generate zip
     */

    async function zipFontKit(fontFiles, fontFamily, newCSS = '', btnDownload, dir = 'fonts/') {

        //console.log('fontFiles', fontFiles);
        //console.log('newCSS', newCSS);

        let fontFamilyFile = fontFamily.replaceAll(' ', '-');
        let zip = new JSZip();
        let cssDir = '';
        let fileDir = ''


        if(dir.includes('..')){
            //dir = 'root/'+dir.replaceAll('..', '')
            fileDir = dir.replaceAll('../', '')
            cssDir = 'css/';
        }


        let articlePrev = document.getElementById('articlePrev');
        let html =
            `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${fontFamily}</title>
<link rel="stylesheet" href="${cssDir}${fontFamilyFile}.css">
<style>
body{
    font-family:${fontFamily}
}
</style>   
</head>
<body>
${articlePrev.innerHTML}
</body>
</html>`

        // add sample css
        if (html) zip.file(`${fontFamilyFile}.html`, html);


        if (newCSS) {
            zip.file(`${cssDir}${fontFamilyFile}.css`, newCSS);

            //add scss
            let mainScss =
                `@import '${dir}${fontFamilyFile}';
                body{font-family:${fontFamily};}
`;
            zip.file(`${cssDir}main.scss`, mainScss);
            zip.file(`${fileDir}_${fontFamilyFile}.scss`, newCSS);
        }

        let suffix = btnDownload.id.toUpperCase().includes('VF') ? '_VF' : '_static';

        // add fonts
        for (let i = 0; i < fontFiles.length; i++) {
            let src = fontFiles[i].orig;
            let filename = fontFiles[i].local;
            let font = await (await fetch(src)).arrayBuffer();

            //console.log(dir);
            zip.file(fileDir + filename, font, { type: "uint8array" });
        }

        let blob = await zip.generateAsync({
            type: "blob"
        });

        btnDownload.href = URL.createObjectURL(blob);
        btnDownload.download = fontFamilyFile + suffix + '.zip';


    }

    function setBtnState(btn, state = '') {

        let loadingSpinner = btn.querySelector('.loadingSpinner');
        let btnLabel = btn.querySelector('.btnLabel');
        let labelArr = btn.dataset.labels.split('| ');

        if (state === 'ready') {
            btn.dataset.state = 'ready';
            loadingSpinner.classList.add('dsp-non')
            btnLabel.textContent = labelArr[2];
        }

        else if (state === 'init') {
            btn.dataset.state = 'init';
            loadingSpinner.classList.add('dsp-non')
            btnLabel.textContent = labelArr[0];
        }

        else if (state === 'loading') {
            btn.dataset.state = 'loading';
            loadingSpinner.classList.remove('dsp-non')
            btnLabel.textContent = labelArr[1];
        }

        return state
    }


    /**
     * create base 64 
     * self contained  CSS
     */

    btnGetBase64_vf.addEventListener('click', async (e) => {
        let cssBase64_Vf = await getBase64CSS(fontExportData.variable)
        cssVF_base64.value = cssBase64_Vf
    })

    btnGetBase64_static.addEventListener('click', async (e) => {
        let cssBase64_static = await getBase64CSS(fontExportData.static)
        cssStatic_base64.value = cssBase64_static
    })


    async function getBase64CSS(data) {

        let { css, files } = data;
        for (let i = 0; i < files.length; i++) {
            let fontFile = files[i]
            let fonFileOrig = fontFile.orig;
            let fonFileLocal = fontFile.dir + fontFile.local;
            let blob = await (await fetch(fonFileOrig)).blob();
            let base64 = await blobToBase64(blob);
            css = css.replaceAll(fonFileLocal, base64)
        }

        return css
    }


    // toggle init status
    toggleInitDisplay();



})()



async function getFilteredFontData(properties, filter, useProxy = false) {
    //update query URL
    let { static, variable } = generateGoogleFontAPIUrl(properties, filter);
    aCSS_vf.href = variable
    aCSS_vf.textContent = variable

    aCSS_static.href = static
    aCSS_static.textContent = static

    //parse css
    static = useProxy ? googleToProxyUrl(static, proxyUrl) : static;
    variable = useProxy ? googleToProxyUrl(variable, proxyUrl) : variable;

    let subsetsStatic = await getCSSSubsetArr(static, filter);

    let cssStatic_obj_local = getNewCSS(subsetsStatic, filter);
    cssStatic_local.value = cssStatic_obj_local.css;
    //let cssStatic_obj_external = getNewCSS(subsetsStatic, filter, false);
    //cssStatic_external.value = cssStatic_obj_external.css;

    let subsetsVF = await getCSSSubsetArr(variable, filter);
    //console.log(subsetsVF);
    let cssVF_obj_local = getNewCSS(subsetsVF, filter);
    cssVF_local.value = cssVF_obj_local.css;
    //let cssVF_obj_external = getNewCSS(subsetsVF, filter, false);
    //cssVF_external.value = cssVF_obj_external.css


    // let cssFiltered = filterCSSRules(cssStatic, filter)
    return { static: cssStatic_obj_local, variable: cssVF_obj_local }


}



/**
 * fetched blob to base64
 */
function blobToBase64(blob) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
}


