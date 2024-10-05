/**
 * filter font list
 */
async function getFilteredGoogleFonts(fontList, filter = {}) {
    let fontListFiltered = fontList

    // merge with defaults
    filter = {
        ...{
            family: [],
            category: [],
            features: [],
            variants: [],
            subsets: [],
            colorCapabilities: [],
            axes: [],
        },
        ...filter
    }
    let filterVals = Object.values(filter).flat().filter(Boolean);

    // empty filter - pass through
    if(!filterVals.length) {
        //console.log('no filter - pass through!');
        return fontList;
    }


    for (let i = 0; i < fontList.length; i++) {
        let font = fontList[i];
        let { family, category, subsets, variants, colorCapabilities, features } = font;

        /**
         *  Check if font matches the category filter
         * otherwise - skip
         */

        // font-family name: overrides other filters
        if (filter.family.length && !filter.family.includes(family)) {
            //console.log(filter);
            continue;
        }

        // has colors
        let colors = font.hasOwnProperty('colorCapabilities') ? font.colorCapabilities : [];
        if (!colors.length && filter.colorCapabilities.length) continue;

        if (colors.length) {
            let hasColors = filter.colorCapabilities.every(color => colorCapabilities.includes(color));
            if (!hasColors) continue;
        }


        // variable fonts
        let axes = font.hasOwnProperty('axes') ? font.axes : [];
        let axesNames = axes.length ? axes.map(item => { return item.tag }) : []


        if (!axesNames.length && filter.axes.length) continue;
        if (axesNames.length) {
            let hasAxes = filter.axes.every(axis => axesNames.includes(axis));
            if (!hasAxes) continue;
        }


        // category: e.g san-serif
        if (filter.category.length && !filter.category.includes(category)) continue;

        // style support: regular, italic
        let hasStyles = filter.variants.every(variant => variants.includes(variant));
        if (!hasStyles) continue;

        // language support: e.g latin-ext, cyrillic
        let hasSubset = filter.subsets.every(subset => subsets.includes(subset));
        if (!hasSubset) continue;

        // Check if font matches the features filter
        let hasFeatures = filter.features.every(feature => features.includes(feature));
        if (!hasFeatures) continue;

        // If the font matches all criteria, add it to the font list array
        fontListFiltered.push(font);
    }


    //console.log('fontListFiltered', fontListFiltered);
    return fontListFiltered
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


