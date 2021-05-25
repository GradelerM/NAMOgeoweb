jQuery(document).ready(function () {

  // Function to get layer name from the clicked thumbnail
  function getPlan (e) {
    var result = e.replace("-toggle", "");
    return result;
  };

  // Calling function getPlan to toogle plans (Fonds de Carte) on click
  $('.plan').click(function () {
    // Get the element's id to find the layer's name
    var elmId = $(this).attr('id');
    if ($(this).hasClass('plan-active')) {
      // Do nothing if the selected plan is already displayed
    } else {
      // Make all plans inactive (grey with "Cliquez pour afficher" indication)
      $('.plan').removeClass('plan-active');
      // Remove all plans from map area
      $('.plan').each(function () {
        var removeId = $(this).attr('id');
        map.removeLayer(window[getPlan(removeId)]);
      });
      // Make this plan active (display thumbnail with colors)
      $(this).addClass('plan-active');
      // Display this plan in the map area
      map.addLayer(window[getPlan(elmId)]);
    }
  });

  // Functions to display layers


});
