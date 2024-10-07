import md2dom from "https://cdn.jsdelivr.net/npm/md2dom@24.2.9/md2dom.min.js";

loadMD(main, 'README.md');

async function loadMD(target, readmefileUrl) {

    const Md = new md2dom();
    let readme = await (await (fetch(readmefileUrl))).text();
    //normalize line breaks
    readme = readme.replace(/\r\n/g, '\n');

    let doc = new DOMParser().parseFromString(readme, 'text/html').querySelector('body')
    let nodes = doc.childNodes

    let els = [];
    nodes.forEach(node => {

        if (node.nodeType === 3) {
            let html = Md.parse(node.textContent);
            console.log(html);
            els.push(...html)

        } else {
            //console.log(node);
            els.push(node)
        }
    })

    target.append(...els);
    fixNestedUls(target)

}


function fixNestedUls(target) {
    let lists = target.querySelectorAll('ul, ol')
    lists.forEach(list => {
        let prev = list.previousElementSibling;
        let children = list.children;
        if (prev.nodeName === list.nodeName && children.length === 1) {
            prev.append(...children);
            list.remove();
        }
    })
}
