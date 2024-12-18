let favCounter = document.getElementById('favCounter')
let btnResetFavs = document.getElementById('btnResetFavs')
let btnShowFavs = document.getElementById('btnShowFavs')


function initFavBtns() {
    let favBtns = document.querySelectorAll('.btn-fav');
    //let favs = settings.favs

    //console.log('update favs');
    updateFavReport(settings);
    bindFavbtns()


    let dialogBtns = document.querySelectorAll('.dialog-btn-close');
    dialogBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            //updateFavItems()
            //settings = JSON.parse(localStorage.getItem('gff_settings'))
            settings = getSettings(storageName)
            toggleFavBtns(settings);
            updateFavReport(settings)
            updateConfirmAccess()
        })
    })



    // reset
    if (btnResetFavs) {

        btnResetFavs.addEventListener('click', e => {
            settings.favs = []

            // reset list
            sectionFavs.innerHTML = '';
            favCounter.innerHTML = 0;


            //update settings
            resetSettings(storageName, settings, 'favs')
            saveSettings(storageName, settings);

            let url = settingsToUrl(settings);
            //console.log('settings', settings, 'url', url);

            let btnsActive = document.querySelectorAll('.btn-fav-active')
            btnsActive.forEach(btn => {
                btn.classList.remove('btn-fav-active')
            })

        })

    }

    // show favs
    if (btnShowFavs) {
        btnShowFavs.addEventListener('click', e => {
            let selectorInput = '.inpFilter';
            //resetFilters(selectorInput);
            updateFavItems(settings);
            //alert('oi')
        })
    }

}

function toggleFavBtns(settings={}) {
    //alert('upd')
    let favBtns = document.querySelectorAll('.btn-fav');
    //console.log('favs', settings.favs);
    //if(!settings.favs) settings.favs=[];

    favBtns.forEach(btn => {
        let family = btn.dataset.fav;
        let index = settings.favs.indexOf(family)

        //console.log(btn);
        if (index > -1 && settings.favs.length) {
            //console.log('add');
            btn.classList.add('btn-fav-active')
        } else {
            //console.log('remove');
            btn.classList.remove('btn-fav-active')

        }
    })
}


function updateFavItems(settings) {
    let items = document.querySelectorAll(`.font-item`);
    items.forEach(item => {

        let family = item.dataset.family;
        if (settings.favs.includes(family)) {
            item.classList.add('show_filtered')
            item.classList.remove('hide_filtered')

        } else {
            item.classList.remove('show_filtered')
            item.classList.add('hide_filtered')
        }

    })
}



function bindFavbtns() {
    let favBtns = document.querySelectorAll('.btn-fav');
    //console.log(settings);

    favBtns.forEach(btn => {

        let family = btn.dataset.fav;
        if(!settings.favs) settings.favs = [];

        let index = settings.favs && settings.favs ? settings.favs.indexOf(family) : -1;

        if (index > -1) {
            btn.classList.add('btn-fav-active')
        }

        // add event listener for new buttons
        if (!btn.classList.contains('btn-fav-ready')) {

            //console.log('add click', family);
            btn.classList.add('btn-fav-ready');

            btn.addEventListener('click', e => {
                let family = btn.dataset.fav;
                let favs = settings.favs
                let index = settings.favs ? favs.indexOf(family) : -1;

                //remove from favs
                if (index > -1) {
                    //console.log('remove');
                    settings.favs.splice(index, 1)
                    btn.classList.remove('btn-fav-active')
                }
                // add
                else {
                    //console.log('add');
                    settings.favs.push(family)
                    btn.classList.add('btn-fav-active')
                }

                //save to storage
                saveSettings(storageName, settings)

                //update counter
                updateFavReport(settings)
                toggleFavBtns(settings);
                //console.log('update fav');

            })
        }
    })
}



function updateFavReport(settings) {
    
    /*sectionFavs.innerHTML = '';
    console.log('updatefavs', settings);
    favCounter.textContent = settings.favs ? settings.favs.length : 0;
    */


    if (favCounter) {

        favCounter.textContent = settings.favs ? settings.favs.length : 0;
        let favList = '<ul id="ulFavs" class="ul-favs">';
        let favArr = settings.favs ? settings.favs : [];


        favArr.forEach(fav => {
            let familyUrl = fav.replaceAll(' ', '+');

            favList +=
                `<li class="li-fav">
                <button class="btn-fav btn-fav-active" data-fav="${fav}" title="Add to favorites">
                <svg viewBox="0 0 114 100" class="icn-svg icn-heart ">
                <use href="#icn-heart" class="icn-fav" /></svg>
                </button>
                <a href="item.html?family=${familyUrl}" data-dialog-src="item.html?family=${familyUrl}" data-dialog="#dialog">${fav}</a>
            </li>`
        })
        favList += `</ul>`;
        sectionFavs.innerHTML = favList;
        // add events
        bindFavbtns()


        //bind dialog btns
        bindDialogBtns('dialog')

    }
}
