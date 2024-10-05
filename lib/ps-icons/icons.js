


//add icon svg
window.addEventListener('DOMContentLoaded', e => {

  observeBodyChanges((mutations) => {
    mutations.forEach(mutation => {
        console.log('Mutation detected:', mutation);
    });
});


  (async () => {
  })();

  initIcons()
})


function observeBodyChanges(callback) {
  const observer = new MutationObserver((mutationsList, observer) => {
      // Execute the provided callback with the mutation records
      callback(mutationsList);
  });

  // Configuration options for the observer
  const config = {
      childList: true,       // Detect direct children additions/removals
      subtree: true,         // Detect changes in all descendants
      attributes: true,      // Detect attribute changes
      characterData: true    // Detect text content changes
  };

  // Start observing the body for changes
  observer.observe(document.body, config);

  // Return the observer instance to allow manual disconnect if needed
  return observer;
}




async function initIcons() {
  let spriteSVGUrl = './lib/ps-icons/icons.svg';
  let res = await (fetch(spriteSVGUrl));
  console.log(res);
  if (res.ok) {
    let sprite = await res.text()
    //console.log(spriteSVGUrl, sprite);
    document.body.insertAdjacentHTML('beforeend', sprite)
    injectIcons();

    //observeBodyChanges(injectIcons)


  }
}







let fontIcons = document.querySelectorAll('[class^="fa-"');
fontIcons.forEach(icn => {
  let classes = [...icn.classList];
  let classIcon;

  classes.forEach(className => {
    if (className.includes('fa-') && !icn.querySelectorAll('svg').length) {
      classIcon = className.replaceAll('fa-', '');
    }
  });

  //injects
  injectIcon(icn, classIcon);
})



/**
 * style standard links
 */
let contentLinks = document.querySelectorAll('.hentry a');
contentLinks.forEach(link => {
  let href = link.href;
  if (href.includes('mailto:') || (href.includes('@') && !href.includes('https://'))) {
    injectIcon(link, 'envelope');
  }

  else if (href.includes('tel:') && !link.classList.contains('fa-phone')) {
    injectIcon(link, 'phone-alt');
  }


})




function injectIcons() {
  let placeholders = document.querySelectorAll("[data-icon]");
  let ns = "http://www.w3.org/2000/svg";

  placeholders.forEach((el) => {
    let data = el.dataset.icon.split(' ');
    let symbolID = 'icn-' + data[0];
    let iconClass = data[1] ? data[1] : '';
    let symbol = document.getElementById(symbolID);

    // console.log('inject icons');
    //console.log(symbol);

    if (symbol) {
      let newSvg = document.createElementNS(ns, "svg");
      let vB = symbol.getAttribute("viewBox");

      //console.log(vB, symbolID);
      newSvg.setAttribute('viewBox', vB)
      newSvg.setAttribute('class', `icn-svg ${symbolID} ${iconClass}`)
      let use = document.createElementNS(ns, "use");
      use.setAttribute('href', '#' + symbolID);
      newSvg.append(use)
      el.replaceWith(newSvg);

    }
  });
}


// replace icon font
function injectIcon(el, symbolID = '') {

  if (symbolID) {
    let ns = "http://www.w3.org/2000/svg";
    //let data = el.dataset.icon.split(' ');
    //symbolID = data[0];
    symbolID = 'icn-' + symbolID;
    let symbol = document.getElementById(symbolID);

    if (symbol) {
      let vB = symbol.getAttribute("viewBox");
      el.insertAdjacentHTML('afterbegin', `<svg viewBox="${vB}" class="icn-inline icn-svg ${symbolID}"><use href="#${symbolID}" /></svg>`);
    }
  }
}


