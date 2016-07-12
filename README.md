# STEMN-Map-Search
Angular components that allow you to search by project near you.

## Introduction
This code was developed for the 2015 International Space Apps Challange. It is visible on the homepage of stemn.com
https://stemn.com/?location=-33.8657305,151.20732999999996,13

### Features
This is an angular JS directive that does the following.
- HTML5 Geolocation to find user position
- Renders Google Map using the GMAP V3 API.
- Observes the bounds of the map (North East and South West Corners)
- Assembles a Query object using the map bounds.
- Renders the location after the query has been completed.
- Animates location when the marker is clicked.

The query and the html to display the project cards is NOT included in this directive.

## How to use this.
Included in the dist are two modules
- Angular UI Google Maps
- Angular Geolocation

These are open source packages available here on github.
The other files are:
- Map-Directive.js
- Map-Directive.css

These govern the styling of the map. For implenentation details, feel free to create a github issue...