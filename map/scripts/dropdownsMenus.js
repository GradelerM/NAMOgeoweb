jQuery(document).ready(function () {
  // Display menu on medium screen
  $('#medium-nav-button').click(function () {
    $('.headerTools').toggleClass('active');
  });

  // Display menu on small screen and mobile
  $('#small-nav-button').click(function () {
    $('.headerNav').toggleClass('active');
  });

  // Initializing the floating legend position (cache compatible)
  function setFloatingLegendTabs () {
    $('#thematic-legend').addClass('legend-active');
    $('#thematic-float').show();
    $('#model-legend').removeClass('legend-active');
    $('#model-float').hide();
  };
  setFloatingLegendTabs();

  // Swap between two floating legend Tabs
  $('#thematic-legend').click(function () {
    if ($(this).hasClass('legend-active')) {
    } else {
      $(this).addClass('legend-active');
      $('#thematic-float').show();
      $('#model-legend').removeClass('legend-active');
      $('#model-float').hide();
    }
  });

  $('#model-legend').click(function () {
    if ($(this).hasClass('legend-active')) {
    } else {
      $(this).addClass('legend-active');
      $('#model-float').show();
      $('#thematic-legend').removeClass('legend-active');
      $('#thematic-float').hide();
    }
  });

  /* Tabs displaying functions */

  // Get tab id from clicked puller arrow id
  function getTabFromArrow (arrowId) {
    var tabId = arrowId.replace("arrow", "tab");
    return tabId;
  };

  // Click on arrow to shrink the corresponding tab
  $('.tab-arrow').click(function () {
    // Get clicked arrow id
    var arrowId = $(this).attr('id');
    $('#'+getTabFromArrow(arrowId)).toggleClass('shrink');
  });

  // Function to activate navlink on click (turn it white and blue)
  function activateTab (navlinkId) {
    $('.navlink').removeClass('active');
    $('#'+navlinkId).addClass('active');
  };

  // Function to hide all tabs
  function hideTabs () {
    $('.tab').addClass('shrink');
    setTimeout(function () {
      $('.tab').addClass('hide');
    }, 500);
  };

  // Get tab id from clicked navbar option
  function getTabFromNavlink (navlinkId) {
    var tabId = navlinkId.replace("navlink", "tab");
    return tabId;
  };

  // Function to animate tabs when the navlink is clicked
  $('.navlink').click(function () {
    var navlinkId = $(this).attr('id');
    var tabId = getTabFromNavlink(navlinkId);
    // Shrink or deploy tab when navlink is already active
    if ($('#'+navlinkId).hasClass('active')) {
      $('#'+tabId).toggleClass('shrink');
    } else {
      activateTab(navlinkId);
      hideTabs();
      setTimeout(function () {
        $('#'+tabId).removeClass('hide');
      }, 501);
      setTimeout(function () {
        $('#'+tabId).removeClass('shrink');
      }, 510);
    }
  });

  /* Couches tab dropdown display */

  // Dropdown thematique-layers on thematique-title click
  $(document).on('click', '.tab-box .thematique-toggle', function () {
    ($(this).find('svg')).toggleClass('deployedArrow');
    var parentThematique = $(this).parents().eq(2).attr('id');
    $('#'+($(this).parents().eq(2).attr('id'))+"-layers").slideToggle();
  });

  // Dropdown layers widgets on layer-name click
  $(document).on('click', '.layer-arrow', function () {
    $(this).toggleClass('deployedArrow');
    $(this).parents().eq(2).find('.layer-widgets').slideToggle();
  });

  /*
  // Checkbox test
  $('input[name=layer1-checkbox]').click(function () {
    if ( $('input[name=layer1-checkbox]').is(':checked') ) {
      console.log('je suis cochée !');
    } else {
      console.log('je ne suis pas cochée !')
    }
  });
  */

  // Help dropdowns
  $('.help-title').click(function () {
    var content = "#" + $(this).attr('id') + "-text";
    var arrow = $(this).find('svg');
    $(content).slideToggle();
    $(arrow).toggleClass('deployedArrow');
  });

  /* Carte narrative dropdown display */
  $(document).on('click', '.story-collection-toggle', function () {
    ($(this).find('svg')).toggleClass('deployedArrow');
    var contentId = $(this).parents().eq(1).attr('id');
    $('#' + contentId + "-content").slideToggle();
  });

  /* Modal windows display */
  // Close all modals on app Loading
  function closeModal() {
    $('.modal').css('display', 'none');
  };
  closeModal();

  $('.close-modal').on('click', function() {
    closeModal();
  });

  $('.stop-modal').on('click', function() {
    closeModal();
  });

  // Authentication modal
  $('#login-button').on('click', function() {
    $('#authentication-modal').css('display', 'block');
  });

  // Authentication modal
  $('#login-button').on('click', function() {
    $('#authentication-modal').css('display', 'block');
  });

  // Signup modal
  $('#signup-button').on('click', function() {
  $('#signup-modal').css('display', 'block');
  });

  // "Accueil" modal
  $('.accueil-link').on('click', function() {
    $('#accueil-modal').css('display', 'block');
  });

  // "A propos" modal
  $('#apropos-link').on('click', function() {
    $('#apropos-modal').css('display', 'block');
  });

  // Tutorial modals
  $('#aide-link').on('click', function() {
    $('#aide-modal-0').css('display', 'block');
  });

  var tooltipsElements = [
    {id: 0, link: ""},
    {id: 1, link: "#navlink-ZoneEtude"},
    {id: 2, link: "#navlink-FondsCarte"},
    {id: 3, link: "#navlink-Couches"},
    {id: 5, link: "#navlink-Storytelling"},
    {id: 6, link: "#navlink-Modeles"},
  ];

  $('.modal-next').on('click', function() {
    closeModal();
    var id     = parseInt($(this)
                 .closest('.modal')
                 .attr('id')
                 .replace('aide-modal-', ''));
    var nextId = id + 1;
    var top    = $(tooltipsElements[nextId].link).offset().top +
                 $(tooltipsElements[nextId].link).height() / 2 + 6;
    nextId     = '#aide-modal-' + nextId;
    var nextIdContent = nextId + ' > .tooltip-modal';
    $(nextId).css('opacity', '0');
    $(nextId).css('display', 'block');
    top = top - $(nextIdContent).height() / 2 - 8;
    $(nextId + ' > .tooltip-modal').css('top', top);
    $(nextId).css('opacity', '100');
  });

  $('.modal-fin').on('click', function() {
    closeModal();
    $('#aide-modal-7').css('display', 'block');
  });

  $('.fin').on('click', function() {
    closeModal();
  });

  // Logout user
  $('#logout-button').click(function () {
    location.href='./logout.php';
  });

// End of document ready function
});
