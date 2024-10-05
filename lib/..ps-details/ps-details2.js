

let summaryIcons = {
    'arrow-right': `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>`,
    'arrow-left': ``,
}


function enhanceDetails(options = {}) {

    // wrap single content
    content2Details();

    // helper sanitize text for anchors
    const textToAnchorUrl = (text) => {
        let anchorId = text.trim().toLowerCase().replace(/[\s/]+/g, '-').replace(/[^a-zA-Z0-9-]/g, '')
        if (!isNaN(anchorId.substr(0, 1))) anchorId = 'a-';
        return anchorId;
    }


    // details wraps
    let details = document.querySelectorAll('details');
    let detailsWraps = [];

    //expand current hash
    let hash = window.location.hash.replace('#', '');

    for (let i = 0; i < details.length; i++) {
        let detail = details[i];
        let parent = detail.parentNode;
        if (!detailsWraps.includes(parent)) {
            detailsWraps.push(parent);
        }
    }

    for (let i = 0; i < detailsWraps.length; i++) {

        let wrap = detailsWraps[i];
        let hasDataAtt = wrap.dataset.hasOwnProperty('details');
        let optionData = wrap.dataset.details ? JSON.parse(wrap.dataset.details) : {};

        // select detail wraps if data attribute or class name is present
        let targetEl =
            hasDataAtt ?
                (optionData.target ? wrap.querySelector('details').closest(optionData.target) : wrap) :
                (wrap.classList.contains('details-enhanced') ? wrap : '');

        
        let detailsToEnhance = document.querySelectorAll('.details-enhance');
        
        // details wrap in selection
        if (!targetEl && !detailsToEnhance.length) continue;


        // merge custom options with defaults
        let optionDefaults = {
            target: '',
            icon: '',
            round: false,
            right: false
        };

        let optionsMerged = {
            ...optionDefaults,
            ...options,
            ...optionData
        }

        let { target, icon, round, right } = optionsMerged;
        //console.log(selected, optionData);

        // process all details instances
        let details = targetEl ? targetEl.querySelectorAll("details") : detailsToEnhance;

        // no parent wrap take single details element with enhanced class
        if (!targetEl) {
            targetEl = detailsToEnhance[0];
            ({ target, icon, round, right } = JSON.parse(targetEl.dataset.details));

        }


        /**
         *  run through details
         */
        details.forEach((detail) => {

            // quit if already processed    
            let processed = detail.classList.contains('details') ? true : false;
            if (processed) return false;

            //add custom class names to prevent multiple processing
            detail.classList.add('details', 'details-enhanced');

            /**
            * all wrap detail's content: 
            * outer wrap for grid display context
            * and inner for hidden overflow
            */
            let detailsContent = document.createElement("div");
            detailsContent.classList.add("details-content");
            let detailsContentInner = document.createElement("div");
            detailsContentInner.classList.add("details-content-inner");

            let children = [...detail.children];
            for (let i = 0; i < children.length; i++) {
                let child = children[i];
                if (child.nodeName.toLowerCase() !== "summary") detailsContentInner.append(child);
            }
            detailsContent.append(detailsContentInner);
            detail.append(detailsContent);


            /**
             * process summary elements
             * append icons
             * add classes: icon types etc.
             * add IDs for anchor navigation
             */
            // replace marker icons from list-style type property    
            let summary = detail.querySelector("summary");
            summary.classList.add("summary");
            let classModifiers = '', summarMarkerStyle = '', summarMarkerAlignment = '', summaryMarkerState = '';

            //add anchor IDs for anchor jumps
            let anchorID = textToAnchorUrl(summary.textContent);

            // if ID is already reserved - add numeric suffix
            if (document.getElementById(anchorID)) {
                let len = document.querySelectorAll(`#${anchorID}`).length;
                anchorID = `${anchorID}-${len + 1}`;
            }
            summary.id = anchorID;

            // custom icon from icon object or svg markup in icon property
            let markerIconCustom = summaryIcons[icon] ? summaryIcons[icon] : (icon ? icon : '');

            /**
            * add expanded classes for
            * default states as specified by 
            * "open" attribute
            */
            //auto expand targeted details by hash/anchor id
            if (hash === anchorID) detail.open = true;
            let expanded = detail.hasAttribute("open");

            // expand when "open" attribute is set
            if (expanded) {
                detail.classList.add("details-expanded");
                summary.classList.add("summary-expanded");
                summaryMarkerState = 'summary-marker-expanded';
                detailsContent.classList.add("details-content-expanded");
            } else {
                summaryMarkerState = 'summary-marker-collapsed';
            }

            /** 
             * add toggle icon
             * 1. add round background
             * 2. customize icon
             */

            // round background
            if (round || targetEl.classList.contains('details-round') || summary.classList.contains('summary-round')) {
                classModifiers = ' summary-marker-round';
            }

            // plus/minus style
            if (icon == '+' || targetEl.classList.contains('details-plus') || summary.classList.contains('summary-plus')) {
                markerIconCustom = '';
                summarMarkerStyle = 'summary-marker-plus';
            }

            // right or left alignment
            if (right || targetEl.classList.contains('details-right') || summary.classList.contains('summary-right')) {
                summarMarkerAlignment = 'summary-marker-right';
            }

            // custom svg icon
            if (markerIconCustom) summarMarkerStyle = 'summary-marker-icon';

            let markerIcon = `<span class="summary-marker ${classModifiers} ${summarMarkerStyle} ${summarMarkerAlignment} ${summaryMarkerState}" aria-hidden="true" focusable="false">${markerIconCustom}</span>`;
            summary.insertAdjacentHTML("afterbegin", markerIcon);


            // inherit transition speed from CSS
            let style = window.getComputedStyle(detailsContent);
            let delay = parseFloat(style.transitionDelay);
            let duration = parseFloat(style.transitionDuration) + delay;

            // toggle events
            summary.addEventListener("click", (e) => {
                e.preventDefault();
                let current = e.currentTarget;
                let detail = current.closest("details");
                let detailsContent = current.parentNode.querySelector('.details-content');
                let summaryMarker = current.querySelector('.summary-marker');
                expanded = detail.hasAttribute("open");

                // collapse
                if (expanded) {
                    detail.classList.remove("details-expanded");
                    detailsContent.classList.remove("details-content-expanded");
                    summary.classList.remove("summary-expanded");
                    summaryMarker.classList.replace("summary-marker-expanded", "summary-marker-collapsed");

                    // wait according to CSS timings to apply open attribute
                    setTimeout(() => {
                        detail.open = false;
                    }, duration * 1000);
                }
                // expand
                else if (!expanded) {
                    detail.open = true;
                    summary.classList.add("summary-expanded");
                    summaryMarker.classList.replace("summary-marker-collapsed", "summary-marker-expanded");

                    // tiny delay for transition
                    timeout = setTimeout(() => {
                        detail.classList.add("details-expanded");
                        detailsContent.classList.add("details-content-expanded");

                    }, 10);
                }
            });

        });

    }
}


/**
 * convert to details wrapped in content class
 * "details-content-init"
 */
function content2Details() {
    let detailsCnt = document.querySelectorAll('.details-content-init');
    detailsCnt.forEach(cnt => {
        let summaryPrev = cnt.previousElementSibling;
        let details = document.createElement('details');
        details.classList.add('details-enhance');
        details.open = cnt.hasAttribute('open') || cnt.classList.contains('details-expanded');

        // get options
        let dataAtt = cnt.getAttribute('data-details');
        if(dataAtt) details.setAttribute('data-details', dataAtt );
        let summary = document.createElement('summary');

        details.append(summary, cnt);
        summaryPrev.parentNode.insertBefore(details, summaryPrev);
        summary.classList.add('summary');
        summary.append(summaryPrev)

    })
}


