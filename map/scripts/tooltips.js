jQuery(document).ready(function() {

  // Tooltips over navlinks (left menu)
  $('.navlink-tooltip-anchor').hover(
    function() {
      var top = $(this).offset().top +
                ($(this).height() / 2) -
                ($(this).next().height() / 2) - 6;
      top = top + "px";
      $(this).next().css({'top':top,
        'visibility':'visible',
        'opacity':'1'}
      );
    }, function() {
      $(this).next().css({'top':top,
        'visibility':'hidden',
        'opacity':'0'}
      );
    }
  );

});
