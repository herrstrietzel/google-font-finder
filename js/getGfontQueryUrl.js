
/**
 * generate google font query URL
 */
function generateGoogleFontAPIUrl(fontProperties, filter = {}) {

    let { family, axes } = fontProperties;
    axes = axes ? axes : [];

    // merge with defaults
    filter = {
        ...{
            axesNames: [],
            styles: [],
            variants: [],
            display: 'swap',
            textSubset: '',
        },
        ...filter
    }
    let { axesNames, styles, variants, display, textSubset } = filter;

    // no filter get full range
    variants = !variants.length ? fontProperties.variants : variants;
    axesNames = !axesNames.length ? fontProperties.axesNames : axesNames;


    let baseUrl = `https://fonts.googleapis.com/css2?family=${family}:`;
    let url_static = baseUrl;
    let url_vf = baseUrl;
    //console.log('filter', filter);


    /**
     * generate static
     */

    let weightsRegular = variants.filter(val => { return !val.includes('italic') }).map(Number).filter(Boolean);
    let weightsItalic = variants.filter(val => { return val.includes('italic') }).map(weight => { return parseFloat(weight) }).filter(Boolean)
    let pre_stc = weightsItalic.length ? (weightsRegular.length ? ['ital', 'wght'] : ['ital']) : ['wght'];
    let post_stc = [];


    if (weightsRegular.length) {
        // prepend 0 or 1 if italic variant is selected
        let weight_arr = weightsItalic.length ? weightsRegular.map(w => { return `0,${w}` }) : weightsRegular;
        post_stc.push(weight_arr)
    }

    if (weightsItalic.length) {
        post_stc.push(weightsItalic.map(w => { return `1,${w}` }))
    }

    //console.log(pre_stc, post_stc, weightsRegular, weightsItalic);
    url_static += `${pre_stc.join(',')}@${post_stc.flat().join(';')}`;

    /**
     * generate VF
     */
    //
    let addItalics = ( !styles.length && fontProperties.styles.includes('italic'))  ||   styles.includes('italic') ? true : false;
    let addRegular = (  !styles.length && fontProperties.styles.includes('regular')) || (styles.includes('regular') ) ? true : false;

    let pre_vf = addItalics ? ['ital'] : [];
    let post_vf = [];



    let suffix = textSubset.length ? `&text=${textSubset}` : '';
    suffix += display.length ? `&display=${display}` : '';


    // no VF - exit
    if (!axes.length) return { static: url_static + suffix, variable: '' };


    // sort axes alphabetically - case sensitive ([a-z],[A-Z])
    let axesSorted = [axes.filter(item => item.tag.toLowerCase() === item.tag), axes.filter(item => item.tag.toUpperCase() === item.tag)].flat()
        .filter(item => { return axesNames.includes(item.tag) });
    let axesTags = axesSorted.map(axis => { return axis.tag })

    pre_vf.push(...axesTags);
    post_vf.push(axesSorted.map(axes => { return `${axes['start']}..${axes['end']}` }));

    url_vf += `${pre_vf.join(',')}@`
    url_vf += addItalics ? (addRegular ? `0,${post_vf.join(',')};1,${post_vf.join(',')}` : `1,${post_vf.join(',')}`) : `${post_vf.join(',')}`;


    return { static: url_static + suffix, variable: url_vf + suffix };
}


function googleToProxyUrl(str, proxyUrl){
    return str.replaceAll('https://fonts.googleapis.com/css2', proxyUrl);
}

function proxyToGoogleUrl(str, proxyUrl){
    return str.replaceAll(proxyUrl, 'https://fonts.googleapis.com/css2');
}


/**
 * filter CSS rules 
 * by subsets
 * get file urls
 */

async function getCSSSubsetArr(href, filter = {}) {
    //console.log('href', href);
    if(!href) return '';



    let css = await (await fetch(href)).text();
    //console.log(css);

    let { subsets, textSubset } = Object.values(filter).length ? filter : { subsets: [], textSubset: [] };

    //create temporary style element
    let styleTmp = new CSSStyleSheet();
    styleTmp.replaceSync(css);
    let cssRules = [...styleTmp.cssRules].filter(item => { return item.type === 5 })

    // get language subsets
    let subsetRules = css.split("/*").filter(Boolean);

    //if using text parameter for subsetting
    let subsetText = textSubset[0] ? textSubset[0] : '';
    subsetRules = subsetText ? cssRules.map(rule=>{return rule.cssText}) : subsetRules;

    // collect data in object
    let newCSS = {};


    for (let i = 0; i < subsetRules.length; i++) {
        //let subsetRule = subsetRules[i];
        let subsetName = subsetText ? subsetText : subsetRules[i].split("*/")[0].trim();
        let style = cssRules[i].style;

        let fontFamily = style.getPropertyValue('font-family').replaceAll('"', "");
        let fontWeight = style.getPropertyValue('font-weight');
        let fontStyle = style.getPropertyValue('font-style');
        let fontStretch = style.getPropertyValue('font-stretch');
        let src = style.getPropertyValue("src").match(/[^]*?url\((.*?)\)/)[1].replaceAll('"', '')

        if (subsets.length && !subsets.includes(subsetName) && !subsetText) continue;

        if (!newCSS[subsetName]) {
            newCSS[subsetName] = [];
        }

        newCSS[subsetName].push({
            file: src,
            fontFamily: fontFamily,
            fontWeight: fontWeight,
            fontStyle: fontStyle,
            fontStretch: fontStretch,
            css: cssRules[i].cssText
        })
    }

    return newCSS;
};


//"https://fonts.gstatic.com/s/opensans/v40/memQYaGs126MiZpBA-UFUIcVXSCEkx2cmqvXlWq8tWZ0Pw86hd0Rk5hkWVAewA.woff2"
function getNewCSS(subsets, filter = {}, localFilenames = true) {

    // new file path
    let directory = filter.directory ? filter.directory : '';
    let files = [];
    let newCSS = ''
    for (sub in subsets) {
        let items = subsets[sub];

        newCSS += `/** ${sub} **/\n`;
        items.forEach(item => {

            let { file, fontFamily, fontWeight, fontStyle, fontStretch, css } = item;
            let ext = 'woff2';

            // new local file name
            let fontname = fontFamily.replaceAll(' ', '') + '_' + [sub, fontWeight, (fontStyle != 'normal' ? fontStyle : ''), (fontStretch != 'normal' &&  fontStretch !=='100%' ? fontStretch : '')].filter(Boolean).map(val => { return val.trim().replaceAll('%', '').replaceAll(' ', '-') } ).join('_') + '.' + ext;

            newCSS += localFilenames ? css.replaceAll(file, directory + fontname) + `\n` : css + `\n`;
            files.push({ orig: file, local: fontname, dir: directory });
            //console.log(fontname);

        })
    }

    //beautify
    newCSS = newCSS.replaceAll('{', '{\n')
    newCSS = newCSS.replaceAll('}', '}\n')
    newCSS = newCSS.replaceAll(';', ';\n')

    return { css: newCSS, files: files }


}

