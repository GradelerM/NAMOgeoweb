/*
var liste_histoires;

jQuery(document).ready(function() {
  // Reading liste-histoires.csv
  $.ajax({
    type: "GET",
    url: "narration/liste_histoires.csv",
    async: false,
    dataType: "text",
    success: function(data) {
      liste_histoires = $.csv.toObjects(data, {"separator" : "\t"});
    },
    error: function() {
      console.log("ERROR : couldn't get liste_histoires.csv");
    }
  });

  // Getting unique story themes for auto-generating HTML divs
  var set_histoires = new Set();
  for (var i = 0; i < liste_histoires.length; i++) {
    set_histoires.add(liste_histoires[i].Theme);
  };

  // Putting unique theme values in a array with unique id
  var theme_histoires = [];
  var themeId = 0;
  set_histoires.forEach(function(theme) {
    theme_histoires.push({theme: theme, id: themeId});
    themeId = themeId + 1;
  });

  // Generating unique story themes in the <div id="bibliotheque-narration"
  for (var i = 0; i < theme_histoires.length; i++) {
    var id    = theme_histoires[i].id;
    var theme = theme_histoires[i].theme;
    var html  =
    '<div id="story-'+id+'" class="story-collection">' +
      '<div class="story-collection-title">' +
        '<a href="#" class="story-collection-toggle">' +
          '<svg class="theme-arrow deployedArrow"><use xlink:href="#iconeArrow" /></use></svg>' +
          '<p>'+theme+'</p>' +
        '</a>' +
      '</div>' +
      '<div id="story-'+id+'-content" class="story-collection-content"></div>' +
    '</div>';
    $('#bibliotheque-narration').append(html);
  };

  // Function for returning theme id
  function idOfTheme(theme) {
    var theme_id = NaN;
    for (var i = 0; i < theme_histoires.length; i++) {
      if (theme_histoires[i].theme === theme) {
        theme_id = theme_histoires[i].id;
      }
    }
    return theme_id;
  };

  // Generating unique story id (different than theme id !)
  var storyId = 0;
  for (var i = 0; i < liste_histoires.length; i++) {
    liste_histoires[i].id = storyId;
    storyId = storyId + 1;
  }

  // Adding story buttons in the right themes
  for (var i = 0; i < liste_histoires.length; i++) {
    // Fetching variables in the object
    var theme     = liste_histoires[i].Theme;
    var theme_id  = idOfTheme(theme);
    var histoire  = liste_histoires[i].Histoire;
    var id        = liste_histoires[i].id;
    var resume    = liste_histoires[i].Resume;

    // Defining in which theme add this button
    var container = $('#story-' + theme_id + '-content');

    // Writing HTML code
    var html =
    '<div class="story-button-div">' +
      '<a href="#"  id="story-button-' + id + '" class="story-button">' +
        '<p>' + histoire + '</p>' +
        '<p>' + resume + '</p>' +
      '</a>' +
    '</div>';

    // Appending html to the right container
    container.append(html);

  }

});
*/
