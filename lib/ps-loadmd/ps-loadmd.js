import md2dom from "https://cdn.jsdelivr.net/npm/md2dom@24.2.9/md2dom.min.js";

loadMD(main, 'readme.md');

async function loadMD(target, readmefileUrl) {

    const Md = new md2dom();
    let readme = await (await (fetch(readmefileUrl))).text();

    //normalize line breaks
    readme = readme.replace(/\r\n/g, '\n');

    let html = Md.parse(readme);
    target.append(...html);

}