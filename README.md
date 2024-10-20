<p align="center" style="text-align:center">
<img width="150" height="150" style="display:inline-block" src="https://raw.githubusercontent.com/herrstrietzel/google-font-finder/refs/heads/main/img/logo/gffi-logo.svg">
</p> 

# Gffi – a google font finder


Find fonts by properties like category, supported languages, variable axes, OT features styles and create fontkits.  

This app is highly inspired by majodev's [google webfont helper](https://gwfh.mranftl.com/fonts). You can either use it to find suitable google fonts meeting all requirements (e.g styles or language support) and use the returned API query URLs or create a fontkit for local font hosting.

## Use cases
- find fonts and use the google cdn
- create fontkits for local usage
- create self contained CSS for demo or educational usage


## Features
* filter fonts by properties
  * font name  
  * category (sans-serif, serif, display etc)
  * language support (available subsets)
  * variable design axes
  * available weights
  * styles (regular, italic)
  * Open type features (e.g smcp –small caps, liga – ligatures etc.)
* create **fontkits**: for GDPR compliant local hosting of google fonts
* retrieve **complete (unsubset) woff2** or truetype fonts
* save **favorites** for recurring font kit creation
* family names are previewed in current font
* create **self-contained CSS** with base64 encoded font references
* subsetting by language support or text query


## Fontkits
A fontkit contains these files:
- font files (according to filters)
- css sample (according to specified path)
- scss includes for easy importing in a main scss
- sample HTML

## Settings cache and URL queries
Once you defined a filter or added favorites all settings are stored in a localStorage item.
All settings are retained when refreshing the page.  
Besides, current settings are resolved as query parameters in the address bar.

So you can also copy/paste parameters via URL e.g

```
https://herrstrietzel.github.io/google-font-finder/?category=sans-serif&axesNames=wdth,wght  
```
Applies a filter showing only sans-serif fonts with variable axes: wdth and wght

```
https://herrstrietzel.github.io/google-font-finder/google-font-finder/?family=Open+Sans
```
Show only "Open Sans"



### Deployed libraries
- [opentype.js](https://github.com/opentypejs/opentype.js) – for preview images
- [jszip.js](https://github.com/Stuk/jszip) – for zipped fontkit creation
- [mdp.js](https://github.com/UmemotoCtrl/mdpjs) for readme parsing
