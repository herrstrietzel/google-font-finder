

<p align="center">
<img width="250" height="250" src="https://github.com/herrstrietzel/google-font-finder/blob/main/img/logo/gffi-logo.svg">
</p> 

# Gffi – a google font finder


Find fonts by properties like category, supported languages, variable axes, OT features styles and create fontkits.  

This app is highly inspired by majodev's [google webfont helper](https://gwfh.mranftl.com/fonts). You can either use it to find suitable google fonts meeting all requirements (e.g styles or language support) and use the returned API query URLs or create a fontkit for local font hosting.

## Use cases
- find fonts and use the google cdn
- create fontkits for local usage
- create self contained CSS for demo or educational usage


## Features
- filter fonts by properties
  - font name  
  - category (sans-serif, serif, display etc)
  - language support (available subsets)
  - variable design axes
  - available weights
  - styles (regular, italic)
  - Open type features (e.g smcp –small caps, liga – ligatures etc.)
- create **fontkits**: for GDPR compliant local hosting of google fonts
- retrieve **complete (unsubset) woff2** or truetype fonts
- save **favorites** for recurring font kit creation
- family names are previewed in current font
- create **self-contained CSS** with base64 encoded font references
- subsetting by language support or text query


## Fontkits
A fontkit contains these files:
- font files (according to filters)
- css sample (according to specified path)
- scss includes for easy importing in a main scss
- sample HTML


### Deployed libraries
- [opentype.js](https://github.com/opentypejs/opentype.js) – for preview images
- [jszip.js](https://github.com/Stuk/jszip) – for zipped fontkit creation
- [md2dom](https://github.com/yne/md2dom) for readme parsing