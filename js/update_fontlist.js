let statusLog = {
    feedback: '',
    processed: 0,
    total: 0
};

//update font data
let limit = 0;



window.addEventListener('DOMContentLoaded', e => {


    //font list
    let inputAPI = document.getElementById('inputAPI');
    //AIzaSyDBXOkDLb08GXnLZq-USTIt0iSJfme4Spg
    let apiKey = '';
    let apiURL_vf_woff2,
        apiURL_static_woff2,
        apiURL_vf_ttf,
        apiURL_static_ttf,
        metaUrlProxy;


    // retrieve apiKey from storage
    if (settings.apiKey) {
        inputAPI.value = settings.apiKey;
    }


    inputAPI.addEventListener('input', async (e) => {
        let apiKey = inputAPI.value;
        apiURL_vf_woff2 = `https://www.googleapis.com/webfonts/v1/webfonts?capability=VF&capability=WOFF2&sort=alpha&key=${apiKey}`;
        apiURL_static_woff2 = `https://www.googleapis.com/webfonts/v1/webfonts?capability=WOFF2&sort=alpha&key=${apiKey}`;
        apiURL_vf_ttf = `https://www.googleapis.com/webfonts/v1/webfonts?capability=VF&capability=CAPABILITY_UNSPECIFIED&sort=alpha&key=${apiKey}`;
        apiURL_static_ttf = `https://www.googleapis.com/webfonts/v1/webfonts?capability=CAPABILITY_UNSPECIFIED&sort=alpha&key=${apiKey}`;

        // meta data
        //let metaUrl = `https://fonts.google.com/metadata/fonts`;
        metaUrlProxy = `${proxyUrl}?meta=true`;



        let res = await (fetch(apiURL_static_ttf))
        //fontList = res.ok ? await (res).json() : [];
        if (res.ok) {
            pUpdate.classList.remove('dsp-non')
            feedbackAPIkey.textContent = 'API key valid. '
            feedbackAPIkey.style.color = 'green'

            // save to local storage
            settings.apiKey = apiKey;
            saveSettings(storageName, settings)
        } else {
            pUpdate.classList.add('dsp-non')
            feedbackAPIkey.textContent = 'API key not valid. '
            feedbackAPIkey.style.color = 'red'
        }

    })

    inputAPI.dispatchEvent(new Event('input'));

    btnUpdateFontList.addEventListener('click', (e) => {
        // updateAllFontData(limit);
        updateAndSaveFontData(apiURL_vf_woff2, apiURL_static_woff2, apiURL_vf_ttf, apiURL_static_ttf, metaUrlProxy);
    });



})



/**
 * merge all font lists
 * variable woff2+ttf
 * static woff2+ttf
 */


async function mergeFontlists(apiURL_vf_woff2, apiURL_static_woff2, apiURL_vf_ttf, apiURL_static_ttf, metaUrlProxy) {

    // VF, woff2
    let list_vf_woff2 = await (await fetch(apiURL_vf_woff2)).json();
    let fontList = list_vf_woff2.items;
    // get files
    fontList = fontList.map(item => { item.files_vf_woff2 = item.files; return item })


    //add axes names
    fontList = fontList.map(item => {
        let axesNames = item.hasOwnProperty('axes') ? item.axes.map(axis => { return axis.tag }) : [];
        item.axesNames = axesNames;
        return item
    })


    let list_static_woff2 = await (await fetch(apiURL_static_woff2)).json();
    fontList = fontList.map((item, i) => { item.files_static_woff2 = list_static_woff2.items[i].files; return item })

    let list_static_ttf = await (await fetch(apiURL_static_ttf)).json();
    fontList = fontList.map((item, i) => { item.files_static_ttf = list_static_ttf.items[i].files; return item })

    let list_vf_ttf = await (await fetch(apiURL_vf_ttf)).json();
    fontList = fontList.map((item, i) => { item.files_vf_ttf = list_vf_ttf.items[i].files; return item })


    // get meta data
    let metaList = await (await (fetch(metaUrlProxy))).json()
    let fonts = metaList.familyMetadataList;

    let metaObj = {}
    //convert to object
    fonts.forEach(font => {
        metaObj[font.family] = font
    })

    await saveJsonToServer(phpUrl, JSON.stringify(metaObj), '../cache/fontList_meta.json');


    // merge to list
    fontList = fontList.map((item, i) => {
        let metaItem = metaObj[item.family]
        if (metaItem) {
            item.designers = metaItem.designers;
            item.dateAdded = metaItem.dateAdded;
            item.popularity = metaItem.popularity;
            item.axes = item.axes ? item.axes.map((axis, i) => { axis.default = metaItem.axes[i].defaultValue; return axis; }) : [];
        }
        return item
        //item.files_vf_ttf = list_vf_ttf.items[i].files; return item 
    })


    //console.log(fontList);

    return fontList;

}


/**
 * wrapper for merging all font lists
 * and generate preview SVG files
 */
async function updateAndSaveFontData(apiURL_vf_woff2, apiURL_static_woff2, apiURL_vf_ttf, apiURL_static_ttf, metaUrlProxy) {

    /**
     * merge all fontlists
     */
    let fontList = await mergeFontlists(apiURL_vf_woff2, apiURL_static_woff2, apiURL_vf_ttf, apiURL_static_ttf, metaUrlProxy);
    //console.log(fontList);

    /**
     * add axes names
     * for filter UI
     */
    fontList = fontList.map(item => {
        let axesNames = item.hasOwnProperty('axes') ? item.axes.map(axis => { return axis.tag }) : [];
        item.axesNames = axesNames;
        return item
    })


    /**
     * add feature data
     * and previews by parsing fonts
     */
    fontList = await parseFontsGetFeaturesAndSVGs(fontList, limit);

    /**
     * save merged list to server
     */
    let fontListMergedJson = JSON.stringify(fontList)
    await saveJsonToServer(phpUrl, fontListMergedJson, '../cache/fontList_merged.json');


}


/**
 * parse fonts via opentyp.js
 * get OT features and save to fontlist data
 * generate preview SVGs
 */
async function parseFontsGetFeaturesAndSVGs(fontList, limit = 0) {

    limit = limit === 0 ? fontList.length : limit;
    let spriteDataObj = { a: [] };
    let lastLetter = 'a';
    let fontSize = 500;
    let fontSizeCanvas = 48;

    statusLog.total = fontList.length;
    statusLog.feedback = 'Parsing fonts';
    renderSatus(pStatus, statusLog);


    //console.log(fontList);

    for (let i = 0; i < fontList.length && i < limit; i++) {

        //update status
        statusLog.processed = i;
        renderSatus(pStatus, statusLog);

        let item = fontList[i];
        let fontname = item.family;
        let initial = fontname.substring(0, 1).toLowerCase();

        //let font = fontList[i];
        let { files_vf_ttf, files_static_ttf } = item;


        // Get the font features via lib.font
        let fontUrl = files_static_ttf.regular ? files_static_ttf.regular : Object.values(files_static_ttf)[0];
        //let fontUrl = files_vf_ttf.regular ? files_vf_ttf.regular : Object.values(files_vf_ttf)[0];


        // parse font
        let buffer = await (await fetch(fontUrl)).arrayBuffer();
        let font = opentype.parse(buffer);

        // add features to item
        let gsub = font.tables.gsub;
        let features = gsub ? gsub.features.map(feat => { return feat.tag }) : [];
        fontList[i].features = [...new Set(features)];

        // generate preview
        let text = item.family;
        let id = text.toLowerCase().replaceAll(' ', '-')


        //add new item
        if (!spriteDataObj[initial]) {
            spriteDataObj[initial] = [];
        }

        // create path data
        let svgData = await renderText(font, text, fontSize, fontSizeCanvas, id);
        //console.log(svgData);

        spriteDataObj[initial].push(svgData)
        //spriteDataArr.push(svgData);

        lastLetter = initial;

    }

    /**
     * save preview svgs
     */
    for (let letter in spriteDataObj) {
        let sprite = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${fontSize * 2} ${fontSize * 2}">
                <style>
                    .f {
                        display: none;
                    }

                    .f:target {
                        display: block;
                    }
                </style>`;

        let fonts = spriteDataObj[letter];
        fonts.forEach(font => {
            sprite += font.markup;
        })
        sprite += '</svg>';

        //update status
        statusLog.feedback = 'Saving SVGs';
        statusLog.processed = fontList.length;
        renderSatus(pStatus, statusLog);

        await saveJsonToServer(phpUrl, sprite, `../img/fontPreviews/${letter}.svg`);

    }



    statusLog.feedback = 'Complete!';
    statusLog.processed = fontList.length;
    renderSatus(pStatus, statusLog);

    //console.log(spriteDataObj);
    return fontList;
}





/**
 * get font features 
 * via opentype.js
 */
async function getFontFeatures(fontUrl) {
    let buffer = await (await fetch(fontUrl)).arrayBuffer();

    // parse
    let font = opentype.parse(buffer);
    //console.log(font);

    let gsub = font.tables.gsub
    let features = gsub && gsub.features ? gsub.features.map(feat => { return feat.tag }) : [];

    return { features: features }

}


function renderSatus(target, statusLog) {
    let html = ''
    for (let prop in statusLog) {

        html += `<strong>${prop}:</strong> ${statusLog[prop]} `

    }
    target.innerHTML = html
}



async function saveJsonToServer(phpUrl, json = '', filename = '') {
    let data = {
        filename: filename,
        content: json
    }

    // save to server  
    let res = await fetch(phpUrl, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    return json;
}
