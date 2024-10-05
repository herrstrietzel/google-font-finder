
/*
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
*/




async function updateFeatureList(phpUrl, fontList, limit = 0) {
    let fontListFeatures = await getGoogleFontsFeatures(fontList, limit);
    let fontListFeaturesJson = JSON.stringify(fontListFeatures)

    let data = {
        filename: '../cache/fontfeaturesList.json',
        content: fontListFeaturesJson
    }

    // save to server  
    let res = await fetch(phpUrl, {
        method: 'POST',
        //mode: 'no-cors',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    //let feedback = await res.text() 
    //console.log('res', feedback);

    return fontListFeaturesJson;

}




async function addFontFeaturesToList(fontList, limit = 0) {
    limit = limit ? limit : fontList.length;
    console.log('limit', limit);

    status.feedback = 'Parsing features'
    renderSatus(pStatus, status);


    for (let i = 0; i < limit; i++) {
        let font = fontList[i];
        let { files_static_ttf } = font;

        // Get the font features via lib.font
        let fontUrl = files_static_ttf.regular ? files_static_ttf.regular : Object.values(files_static_ttf)[0];

        let features = await (await getFontFeatures(fontUrl)).features;

        status.processed = i;
        renderSatus(pStatus, status);


        //save to item
        font.features = features;

    }

    status.feedback = 'Features parsed!'
    status.processed = fontList.length;
    renderSatus(pStatus, status);

    //return fontListFeatures
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
    let features = gsub && gsub.features ? gsub.features.map(feat=>{return feat.tag  }) : [];

    return {features: features}


}