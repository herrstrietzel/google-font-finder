
/**
 * toggle darkmode
 */
let inputDarkmode = document.getElementById('inputDarkmode');
getDarkmode();

function getDarkmode() {
    let darkmodePreferred = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let useDarkmode = darkmodePreferred || settings.darkmode;

    if (useDarkmode) {
        if (inputDarkmode) inputDarkmode.checked = true;
        document.body.classList.add('darkmode')
    }
}


if (inputDarkmode) {
    inputDarkmode.addEventListener('click', (e) => {
        let darkmode = e.currentTarget.checked;
        if (darkmode) {
            document.body.classList.add('darkmode')
            settings.darkmode = true;
        } else {
            document.body.classList.remove('darkmode')
            settings.darkmode = false;
        }

        saveSettings(storageName, settings)
        //console.log(settings);

    });

}