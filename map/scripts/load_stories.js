// Functions to load stories from the database
// Used in map.php (displaying a story) and in storytool.php (generating a story preview)

/*
=================================================================
Reading the database to write a story map
=================================================================
*/

// Function to write the story Html
function writeStoryMap(map, source, book_id) {

    // Check the source and define url
    if (source == 'map.php') {
        var url = './public_api.php';
    } else if (source == 'storytool.php') {
        var url = './api.php';
    } else { // Exit the function
        return;
    }

    // Fecth the book's content
    $.ajax({
        url: url,
        method: 'POST',
        async: true,
        data: {
            mode: 'write_storymap',
            book_id : book_id,
        },
        dataType: 'json',
        success: function(response) {

            // Do something if this is a success
            if (response.success == true) {

                // Empty the story div
                $('#story').empty();

                // Write the story
                var storymap = writeStoryHtml(response.storymap);
                $('#story').append(storymap);

                // Write the map interactions depending on the response.status
                if (response.origin == "private") {

                    // Put here the script to execute on storytool.php

                    // The storymap
                    var storyContainer = new ol.control.Storymap({
                        target: document.getElementById('story')
                    });
                    
                    // Show image fullscreen on click               
                    var fullscreen = new ol.control.Overlay ({ hideOnClick: true, target: document.body });
                    map.addControl(fullscreen);
                    storyContainer.on('clickimage', function(e){
                        fullscreen.showImage(e.img.src, { title: e.title });
                        $('.ol-fullscreen-image').parent().css('z-index', 999999999).css('background-color', 'rgba(0,0,0,.9)');
                    });
                    
                    // Create the main interactions between the story and the map
                    storyContainer.on('scrollto', function(e) {
                        // Edit the currenlty selected chapter
                        $('#story .chapter').removeClass('select');
                        $(e.element).addClass('select');
                        map.getView().cancelAnimations();

                        // If the introduction is targeted
                        if (e.name === "Introduction") {
                            var chapter     = response.storymap.introduction;

                        } else { // For the chapters

                            // Fetch the needed elements for updating the map's view
                            var number      = e.name.replace('Chapter', '');
                            var chapter     = response.storymap.chapters[number];

                        }

                        // Fetch the needed elements for updating the map's view
                        var basemap     = chapter.map.basemap;
                        var layers      = chapter.map.layers;

                        if (layers) {
                            var layers  = chapter.map.layers.split(',');
                        }
                        var latitude    = chapter.map.latitude;
                        var longitude   = chapter.map.longitude;
                        var zoom        = chapter.map.zoom;

                        var center      = ol.proj.fromLonLat([latitude, longitude]);

                        // Edit basemap
                        if (basemap) {
                            changeBasemap(basemap); // Defined in storytool_interactions.js
                        }

                        // Edit layers
                        if (layers) {
                            changeLayers(layers);
                        }

                        // Edit the map's center and zoom
                        map.getView().animate({
                            center: center,
                            zoom: zoom
                        });

                    });


                    map.addControl(storyContainer);
                    

                } else if (response.origin == "public") {
                    
                    // Put here the script to execute on map.php

                    // The storymap
                    var storyContainer = new ol.control.Storymap({
                        target: document.getElementById('story')
                    });
                    
                    // Show image fullscreen on click               
                    var fullscreen = new ol.control.Overlay ({ hideOnClick: true, target: document.body });
                    map.addControl(fullscreen);
                    storyContainer.on('clickimage', function(e){
                        fullscreen.showImage(e.img.src, { title: e.title });
                        $('.ol-fullscreen-image').parent().css('z-index', 999999999).css('background-color', 'rgba(0,0,0,.9)');
                    });
                    
                    // Create the main interactions between the story and the map
                    storyContainer.on('scrollto', function(e) {
                        // Edit the currenlty selected chapter
                        $('#story .chapter').removeClass('select');
                        $(e.element).addClass('select');
                        map.getView().cancelAnimations();

                        // If the introduction is targeted
                        if (e.name === "Introduction") {
                            var chapter     = response.storymap.introduction;

                        } else { // For the chapters

                            // Fetch the needed elements for updating the map's view
                            var number      = e.name.replace('Chapter', '');
                            var chapter     = response.storymap.chapters[number];

                        }

                        // Fetch the needed elements for updating the map's view
                        var basemap     = chapter.map.basemap;
                        var layers      = chapter.map.layers;

                        if (layers) {
                            var layers      = chapter.map.layers.split(',');
                        }
                        var latitude    = chapter.map.latitude;
                        var longitude   = chapter.map.longitude;
                        var zoom        = chapter.map.zoom;

                        var center      = ol.proj.fromLonLat([latitude, longitude]);

                        // Edit basemap
                        if (basemap) {
                            changeFondDeCarte(basemap);
                        }

                        // Hide all the layers
                        hideAllLayers();

                        // Edit layers
                        if (layers) {
                            for (let i = 0; i < layers.length; i++) {
                                var layer = window[layers[i]];
                                if (layer) {
                                    displayLayer(layers[i]);
                                }
                            }
                        }

                        // Edit the map's center and zoom
                        map.getView().animate({
                            center: center,
                            zoom: zoom
                        });

                        // And check if we have to display the legend or not
                        emptyLegendMessage();

                    });


                    map.addControl(storyContainer);

                }

            } else { // Do something else if success == false

                if (response.origin == 'public') {

                    // Empty the story div
                    $('#story').empty();

                    // Write an error message to display
                    var message = 
                    '<p class="error"><i>' +
                    'La carte narrative n\'a pas pu être chargée. Essayez de recharger l\'application.'+
                    'Si le problème persiste, merci de contacter un administrateur.' +
                    '</i></p>';

                    $('#story').append(message);

                }

            }

        },
        error: function(response) {
            console.error(response.error);
        }
    });   
};

/*
=================================================================
Writing the storymap's html content
=================================================================
*/
function writeStoryParagraphs(chapter) {
    var template;
    var paragraph = '';
    var html = '';

    for (let i = 0; i < chapter.paragraphs.length; i++) {
        template = getParagraphTemplate(chapter.paragraphs[i].type).storyTemplate;
        paragraph = template(chapter.paragraphs[i].content, chapter.paragraphs[i].url)
        html = html + paragraph;
    }

    // Return the result
    return html;
}

function writeStoryHtml(storymap) {

    // Init variables
    var storyHtml = '';

    // Write the introduction content
    var introHtml = writeStoryParagraphs(storymap.introduction);

    // Write the chapters' content
    var chapHtml = '';
    for (let i = 0; i < storymap.chapters.length; i++) {
        var chapTemp =  '<div class="chapter" name="Chapter' + i + '">' +
                        '<h1>' + storymap.chapters[i].title + '</h1>' +
                        writeStoryParagraphs(storymap.chapters[i]) +
                        '</div>';
        chapHtml = chapHtml + chapTemp;
    }

    // Add all the elements to the storyHtml
    storyHtml = 
        '<div class="chapter" name="Introduction">' +
        '<h1 class="story-title">' + storymap.title + '</h1>' +
        '<p class="story-info authorname">Auteur : ' + storymap.author + '</p>' +
        '<p class="story-info legalnotice">Informations : ' + storymap.legal_notice + '</p>' +
        '<p class="story-info publicationdate">Date de publication : ' + storymap.publication_date + '</p>' +
        '<hr>' +
        introHtml +
        '<div class="ol-scroll-next"><span>Début</span></div>' +
        '</div>' +
        chapHtml +
        '<div class="ol-scroll-top"><span>Retourner au début</span></div>';

    // And return the whole html at the end
    return storyHtml;
}

// Function to escape html content before saving it
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function escapeHtmlRevert(safe) {
    return safe
        .replaceAll("&amp;", '&')
        .replaceAll("&lt;", '<')
        .replaceAll("&gt;", '>')
        .replaceAll("&quot;", '"')
        .replaceAll("&#039;", "'");
}
