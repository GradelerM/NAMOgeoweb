// Note: this script is used in storytool_interactions.js and load_stories.js
// It must be called in map.php and storytool.php
// If you encounter some "function() is not defined" error types, please make sure these conditions are fullfilled

/*
=================================================================
Main paragraph structure array
=================================================================
*/ 
// Storing all paragraphs templates in one array
var paragraphTemplate = [
    /*
    {
        type: 'textHtml',
        title: 'Texte',
        info: 'format HTML',
        option: ['',''],
        template: textHtmlTemplate,
        storyTemplate: textHtmlStoryTemplate,
        destination: [
            {
                input: 'content-input',
                target: 'content'
            }
        ]
    },
    */
    {
        type: 'textMarkdown',
        title: 'Texte',
        info: 'format Markdown',
        // Option ['option name', 'option class']
        // The option is a link that can be added in the paragraph's topbar like an helper
        // See newParagraphTopbar() for further information
        option: ['Aide', 'markdown-guide-link'],
        template: textMarkdownTemplate,
        storyTemplate: textMarkdownStoryTemplate,
        destination: [
            {
                input: 'content-input',
                target: 'content'
            }
        ]
    },
    {
        type: 'localPicture',
        title: 'Image interne',
        info: 'JPG, JPEG, PNG, GIF',
        option: ['',''],
        template: localPictureTemplate,
        storyTemplate: localPictureStoryTemplate,
        destination: [
            {
                input: 'local-picture-input',
                target: 'url'
            },
            {
                input: 'local-picture-legend',
                target: 'content'
            }
        ]
    },
    /*
    {
        type: 'remotePicture',
        title: 'Image externe',
        info: 'JPG, JPEG, PNG, GIF',
        option: ['',''],
        template: remotePictureTemplate,
        storyTemplate: remotePictureStoryTemplate,
        destination: [
            {
                input: 'remote-picture-input',
                target: 'url'
            },
            {
                input: 'remote-picture-legend',
                target: 'content'
            }
        ]
    }
    */
];

// Retrieve paragraph template from the paragraphTemplate array
function getParagraphTemplate(type) {
    var values;
    paragraphTemplate.forEach(function(e) {
        if (e.type == type) {
            values = e;
        }
    });
    return values;
};


/*
=================================================================
Paragraphs templates: cards in the storytool.php GUI
=================================================================
*/ 
// Paragraphs templates
function textHtmlTemplate(content) {
    // Setting content default value for empty paragraph initialization
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        content = '<p>Cliquez ici pour écrire du texte</p>';
    }
    // Writing html code content
    var result =    '<div class="paragraph-body">' +
                    '<hr>' +
                    '<div class="editable">' +
                    '<div class="view-mode">' +
                    content +
                    '</div>' +
                    '<div class="edit-mode hidden">' +
                    '<textarea class="content-input focus" rows="16" maxlength="10000">' + content + '</textarea>' +
                    '</div>' +
                    '</div>' +
                    '</div>' ;               
    return result;
};

function textMarkdownTemplate(content) {
    // Setting content default value for empty paragraph initialization
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        var rawContent = '';
        var renderedContent = 'Cliquez ici pour ajouter du texte';
    } else {
        // "content" isn't empty, give its value to rawContent
        var rawContent = content;
        // Rendering the markdown text using the Remarkable library
        var md = new remarkable.Remarkable();
        var renderedContent = md.render(content);
    }
    // Writing html code content
    var result =    '<div class="paragraph-body">' +
                    '<hr>' +
                    '<div class="editable">' +
                    '<div class="view-mode markdown-render">' +
                    renderedContent +
                    '</div>' +
                    '<div class="edit-mode hidden">' +
                    '<textarea class="content-input focus" rows="16" maxlength="10000">' + rawContent + '</textarea>' +
                    '</div>' +
                    '</div>' +
                    '</div>' ;

    return result;
};

function localPictureTemplate(content, url) {
    // Setting content default value for empty paragraph initialization
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        message = '[Cliquez pour ajouter du contenu]';
        content = '';
    } else {
        message = content;
    }
    if (!/\S/.test(url) || typeof url == 'undefined' || url == null) {
        url = '';
    }

    // Writing html code content
    var result =    '<div class="paragraph-body">' +
                    '<hr>' +
                    '<div class="picture-editor">' +
                    '<div class="picture-input">' +
                    '<form class="local-picture-input-form" action="/map/api.php" method="POST" enctype="multipart/form-data">' +
                    '<label for="local-picture-input">Image : </label>' +
                    '<div class="align-items-center">' +
                    '<input class="local-picture-input" name="local-picture" type="file" accept="image/png, image/jpeg, image/jpg, image/gif">' +
                    '<svg class="medium infoTooltip internal-image-info"><use xlink:href="#iconeInfo" /></use></svg>' +
                    '</div>' +
                    '</form>' +
                    '</div>' +
                    '<div class="picture-error"></div>' +
                    '<div class="picture-caption">' +
                    '<img src="' + url + '" height="200" alt=" "/>' +
                    '</div>' +
                    '</div>' +
                    '<div class="editable">' +
                    '<div class="view-mode">' + 
                    message +
                    '</div>' +
                    '<div class="edit-mode hidden">' +
                    '<label for="local-picture-legend"></label>' +
                    '<input type="text" class="focus local-picture-legend" name="local-picture-legend" size="40" minlength="0" maxlength="800" placeholder=Contenu de ma légende" value="' + content + '">' +
                    '<svg class="medium infoTooltip image-legend-info"><use xlink:href="#iconeInfo" /></use></svg>' +
                    '</div>' +
                    '</div>' +
                    '</div>' ;
    return result;
};

function remotePictureTemplate(content, url) {
    // Setting content default value for empty paragraph initialization
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        message = '[Cliquez pour ajouter du contenu]';
        content = '';
    } else {
        message = content;
    }
    if (!/\S/.test(url) || typeof url == 'undefined' || url == null) {
        url = '';
    }

    // Writing html code content
    var result =    '<div class="paragraph-body">' +
                    '<hr>' +
                    '<div class="picture-editor">' +
                    '<div class="picture-input">' +
                    '<label for="local-picture-input">Image : </label>' +
                    '<div class="align-items-center">' +
                    '<input class="local-picture-input" name="local-picture-input" type="file" accept="image/png, image/jpeg, image/jpeg, image/gif">' +
                    '<svg class="medium infoTooltip external-image-info"><use xlink:href="#iconeInfo" /></use></svg>' +
                    '</div>' +
                    '</div>' +
                    '<div class="picture-error"></div>' +
                    '<div class="picture-caption">' +
                    '<img src="' + url + '" height="200" alt=" "/>' +
                    '</div>' +
                    '</div>' +
                    '<div class="editable">' +
                    '<div class="view-mode">' +
                    message +
                    '</div>' +
                    '<div class="edit-mode hidden">' +
                    '<label for="local-picture-legend"></label>' +
                    '<input type="text" class="focus local-picture-legend" name="local-picture-legend" size="40" minlength="0" maxlength="800" placeholder=Contenu de ma légende" value=' + content + '>' +
                    '<svg class="medium infoTooltip image-legend-info"><use xlink:href="#iconeInfo" /></use></svg>' +
                    '</div>' +
                    '</div>' +
                    '</div>' ;
    return result;
};


/*
=================================================================
Paragraphs templates: displaying the storymap
=================================================================
*/ 
function textHtmlStoryTemplate(content) {
    // Set empty strings if undefined
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        html = '';
    }

    // Write html
    var html = content;
    return html;
};

function textMarkdownStoryTemplate(content) {
    // Set empty strings if undefined
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        html = '';
    }

    // Convert markdown to html
    var md = new remarkable.Remarkable();

    // Write html
    var html = md.render(content);
    return html;
};

function localPictureStoryTemplate(content, url) {
    // Set empty strings if undefined
    if (!/\S/.test(content) || typeof content == 'undefined' || content == null) {
        message = '';
        content = '';
    } else {
        message = content;
    }
    if (!/\S/.test(url) || typeof url == 'undefined' || url == null) {
        url = '';
    }

    // Write html
    var html =  '<img class="story-media" data-title="' + content + '" src="' + url + '" />' +
                '<p class="source">' + content + '</p>';

    return html;
};

function remotePictureStoryTemplate(content, url) {
    // WIP
    html = '';
    return html;
};

