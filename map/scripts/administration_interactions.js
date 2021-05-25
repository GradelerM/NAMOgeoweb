jQuery(document).ready(function(){

    /* 
    =================================================================================
    Function to go back to map.php when clicking on the icon
    =================================================================================
    */
    $('#back-to-map').click(function() {
        $('#back-to-map-modal').removeClass('hidden');
    });

    $('#back-to-map-modal-no').click(function() {
        $('#back-to-map-modal').addClass('hidden');
    });

    /* 
    =================================================================
    Defining variables to be used later in the functions
    =================================================================
    */
    // Defining the available roles
    var roles = [
        ['admin', 'Administrateur'],
        ['editor', 'Editeur'],
        ['contributor', 'Contributeur']
    ];

    /* 
    =================================================================
    Swap between different tabs 
    =================================================================
    */
    $('.tab').click(function() {
        var tabId = $(this).attr('id');
        var contentId = tabId.replace("tab", "content");
        $('.tab').each(function() {
            $(this).addClass("disabled");
        });
        $('.content-window').each(function() {
            $(this).addClass("hidden");
        });
        $('#' + tabId).removeClass("disabled");
        $('#' + contentId).removeClass("hidden");
    });

    /* 
    =================================================================
    Define buttons to display in the interface tables
    =================================================================
    */
    // 'type' can be 'positive', 'negative' or 'neutral' (or match any other style defined later in the css)
    // it matches the backoffice.css styles button.positive and button.negative
    // 'content' must be the string that will be displayed on the button
    
    // And additional class can be added in 'type', see example below

    // Use example : addButton('positive authorize', 'Autoriser');
    // See in the function fetchUserData() for more examples

    function addButton(type, content) {
        var btn = '<button class="' + type + '">'+ content +'</button>';
        return btn;
    }

    /* 
    =================================================================
    Define main reusable elements
    =================================================================
    */
    // Main modal for displaying information messages
    function displayMessageModal(message) {
        $("#modal-admin-interface").dialog({
            modal: true,
            minWidth: 480,
            close: function () {
                $(this).empty();
            }
        }).append(message);
    };

    // Error message modal
    function displayErrorModal(message) {
        $("#modal-admin-interface-error").dialog({
            modal: true,
            close: function () {
                $(this).empty();
            }
        }).append(message);
    }

    /* 
    =================================================================
    Field validation functions
    =================================================================
    */
    // Function for checking if a value is empty/undefined or not
    // If it is, returns false
    function checkIfEmpty(content) {

        if (!/\S/.test(content) || content == 'undefined') {
            var response = false;
        } else {
            var response = true;
        }
        return response;

    }

    /* 
    =================================================================
    Load users informations (username, motives, possibility to allow or deny access to the application)
    =================================================================
    */
    // Function to empty the tables (needed for reloading)
    function emptyUserTables() {
        $('#pending-users-list thead').empty();
        $('#pending-users-list tbody').empty();
        $('#allowed-users-list thead').empty();
        $('#allowed-users-list tbody').empty();
    }
    
    // We check if the user is an administrator in the api (admin_api.php)
    function fetchUserData() {
        
        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'fetch_userdata'
            },
            dataType: 'json',
            beforeSend: function() {
                // Show the loaders
                $('#pending-users-list .loader-container').show();
                $('#allowed-users-list .loader-container').show();

                // Empty the tables (comes in handy when reload is needed)
                emptyUserTables();

            },
            success: function(response) {

                // Make sure the query returned no errors
                if (response.success == true) {
                    
                    // Add the pending user's table head unless it is empty
                    if (response.pending_users.length == 0) { // No pending users, display a message

                        $('#pending-users-list thead').append("<i>Aucun utilisateur en attente</i>");
                        
                    } else { // Pending users, display the table's header
                        var table_head =
                            '<tr>' +
                                '<td>Utilisateur</td>' +
                                '<td>Motif</td>' +
                            '</tr>';
                        $('#pending-users-list thead').append(table_head);
                    }
                    
                    // Display all of the pending users in the corresponding table
                    for (let i = 0; i < response.pending_users.length; i++) {
                        var user = response.pending_users[i];

                        var table_row = 
                            '<tr id="userid-' + user.id + '">' + // We give this row and id = user id
                                '<td class="username">' + user.username + '</td>' +
                                '<td class="user-motivation">' + user.motivation + '</td>' +
                                '<td>' + addButton('positive allow_user', 'Autoriser') + '</td>' +
                                '<td>' + addButton('negative reject_user', 'Refuser') + '</td>' +
                            '</tr>';
                        
                        // Append the row to the existing table
                        $('#pending-users-list tbody').append(table_row);

                    }

                    // Add the allowed user's table head unless it is empty (this shouldn't happen, but just in case...)
                    if (response.allowed_users.length == 0) { // No pending users, display a message

                        $('#pending-users-list thead').append("<i>Aucun utilisateur</i>");
                        
                    } else { // Allowed users, display the table's header
                        var table_head =
                            '<tr>' +
                                '<td>Utilisateur</td>' +
                                '<td>Rôle</td>' +
                                '<td>Motif</td>' +
                            '</tr>';
                        $('#allowed-users-list thead').append(table_head);
                    }

                    // Function to write the "select" element for roles
                    // user_id = the current administrator's id
                    // id = the user's id
                    // role = the user's current role
                    function selectUserRoles(admin_id, id, role) {

                        // We create the list only if user_id =/= online user 
                        // So an admin cannot edit his own role
                        // And we always have at least one admin available on the platform
                        if (id == admin_id) {

                            // Look for the right role to display above
                            for (let i = 0; i < roles.length; i++) {
                                if (roles[i][0] == role) {
                                    var result = roles[i][1];
                                }
                            }

                        } else { // Now create the select lists for all the other users
                            var result = '<div class="flex"><select name="select-user-role" class="select-user-role" disabled>';

                            // Create a select option for each role available
                            for (let i = 0; i < roles.length; i++) {

                                // If this is already the user's role, add the "select" tag to it
                                if (roles[i][0] == role) {
                                    result = result + '<option value="' + roles[i][0] + '" selected>' + roles[i][1] + '</option>';
                                } else {
                                    result = result + '<option value="' + roles[i][0] + '">' + roles[i][1] + '</option>';
                                }
                            }

                            // And close the select tag and the "edit" button
                            result = result + '</select>';
                            result = result + '<a href="#" class="edit-user-role-toggle"><svg><use xlink:href="#iconeParameters" /></use></svg></a>';
                            result = result + '</div>';
                        }

                        return result;
                    };

                    // Display all the allowed users in the corresponding table
                    for (let i = 0; i < response.allowed_users.length; i++) {
                        var user = response.allowed_users[i];
                        var table_row = 
                            '<tr id="userid-' + user.id + '">' + // We give this row and id = user id
                                '<td class="username">' + user.username + '</td>' +
                                '<td class="user-role">' + 
                                    selectUserRoles(response.admin_id, user.id, user.role) +
                                '</td>' +
                                '<td class="user-motivation">' + user.motivation + '</td>';

                        // Only display the "revoke_user" button for other users than the current one
                        // So he can't "auto-ban" himself
                        if (response.admin_id == user.id) {
                            table_row = table_row + '<td></td>';
                        } else {
                            table_row = table_row + '<td>' + addButton('negative revoke_user', 'Retirer') + '</td>';
                        }

                            table_row = table_row + '</tr>';
                        
                        // Append the row to the existing table
                        $('#allowed-users-list tbody').append(table_row);
                    }

                } else { // There was an error

                    // Display the error message
                    var message = 
                        "<p>Une erreur s'est produite :</p>" +
                        "<p>" + response.error + "</p>"; 
                    displayMessageModal(message);

                }

            },
            // Remove the loader once the query is completed
            complete: function() {
                // Hide the loaders
                $('#pending-users-list .loader-container').hide();
                $('#allowed-users-list .loader-container').hide();
            },
            error: function(response) {
                console.error(response.error);
            }
        });

    };
    fetchUserData();

    /* 
    =================================================================
    Interactions to enable a new user
    =================================================================
    */
    // Function to allow an user to auth to the app
    function allowUser(user_id) {
        
        // Send the request to the server
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'allow_user',
                id: user_id
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
               
                // Check if any error happened
                if (response.success == true || response.success == false && response.error_code == 2) { // No error happened, we can keep processing

                    // Display the modal with a successful message
                    var message = "<p>L'utilisateur peut maintenant s'authentifier sur l'application</p>"; 
                    displayMessageModal(message);

                    // Reload the tables
                    fetchUserData();
                    
                } else { // An error happened, display 
                    
                    console.error(response.error);
                    
                    var message = 
                        "<p>Une erreur s'est produite :</p>" +
                        "<p>" + response.error + "</p>"; 
                    displayMessageModal(message);

                }

            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
            }
        });
    };

    // Confirmation modal: allow user
    function allowUserModal(user_id, message) {
        $('#allow-user-modal').dialog({
            user_id: user_id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Autoriser": function () {
                    $(this).dialog("close");
                    allowUser(user_id);
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).empty();
            }
        }).append(message);
    };

    // Trigger allowUserModal() when "autoriser" / "allow" button is clicked
    $(document).on('click', 'button.allow_user', function () {
        var user_id = $(this).parents('tr').attr('id').replace('userid-', '');
        var username = $(this).parents('tr').find('.username').html();

        // Write message and open modal which triggers the next elements
        var message = "<p>Voulez-vous autoriser l'utilisateur <b>" + username + "</b> à accéder à la plateforme ?</p>";
        allowUserModal(user_id, message);

        // Unbind the event
        $(this).off();
    });

    /* 
    =================================================================
    Interactions to NOT enable a new user
    =================================================================
    */
    function rejectUser(user_id) {
        
        // Send the request to the server
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'reject_user',
                id: user_id
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                
                // Check if any error happened
                if (response.success == true || response.success == false && response.error_code == 2) { // No error happened, we can keep processing

                    // Display the modal with a successful message
                    var message = "<p>La demande a été rejetée et l'utilisateur a été supprimé.</p>"; 
                    displayMessageModal(message);

                    // Reload the tables
                    fetchUserData();
                    
                } else { // An error happened, display 
                    
                    console.error(response.error);
                    
                    var message = 
                        "<p>Une erreur s'est produite :</p>" +
                        "<p>" + response.error + "</p>"; 
                    displayMessageModal(message);

                }

            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
            }
        });
    };

    // Confirmation modal: allow user
    function rejectUserModal(user_id, message) {
        $('#allow-user-modal').dialog({
            user_id: user_id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Rejeter la demande": function () {
                    $(this).dialog("close");
                    rejectUser(user_id);
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).empty();
            }
        }).append(message);
    };

    // Trigger rejectUserModal() when "refuser" / "reject" button is clicked
    $(document).on('click', 'button.reject_user', function () {
        var user_id = $(this).parents('tr').attr('id').replace('userid-', '');
        var username = $(this).parents('tr').find('.username').html();

        // Write message and open modal which triggers the next elements
        var message = "<p>Voulez-vous rejeter la demande de l'utilisateur <b>" + username + "</b> ? Son compte sera supprimé et il ne pourra pas accéder à la plateforme à moins d'effectuer une nouvelle demande.</p>";
        rejectUserModal(user_id, message);

        // Unbind the event
        $(this).off();
    });

    /* 
    =================================================================
    Interactions to revoke the user's rights to use the application
    =================================================================
    */
    function revokeUser(user_id) {
        
        // Send the request to the server
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'revoke_user',
                id: user_id
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
               
                // Check if any error happened
                if (response.success == true || response.success == false && response.error_code == 2) { // No error happened, we can keep processing

                    // Display the modal with a successful message
                    var message = "<p>L'utilisateur ne peut maintenant plus accéder aux outils de contribution de la plateforme.</p>"; 
                    displayMessageModal(message);

                    // Reload the tables
                    fetchUserData();
                    
                } else { // An error happened, display 
                    
                    console.error(response.error);
                    
                    var message = 
                        "<p>Une erreur s'est produite :</p>" +
                        "<p>" + response.error + "</p>"; 
                    displayMessageModal(message);

                }

            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
            }
        });
    };

    // Confirmation modal: allow user
    function revokeUserModal(user_id, message) {
        $('#allow-user-modal').dialog({
            user_id: user_id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Retirer les droits": function () {
                    $(this).dialog("close");
                    revokeUser(user_id);
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).empty();
            }
        }).append(message);
    };

    // Trigger rejectUserModal() when "refuser" / "reject" button is clicked
    $(document).on('click', 'button.revoke_user', function () {
        var user_id = $(this).parents('tr').attr('id').replace('userid-', '');
        var username = $(this).parents('tr').find('.username').html();

        // Write message and open modal which triggers the next elements
        var message = "<p>Voulez-vous retirer les droits de l'utilisateur <b>" + username + "</b> ? Il ne pourra plus accéder aux outils de contribution de la plateforme jusqu'à ce que vous l'y autorisiez à nouveau.</p>";
        revokeUserModal(user_id, message);

        // Unbind the event
        $(this).off();
    });

    /* 
    =================================================================
    Interactions to edit an user's permissions
    =================================================================
    */
    // Confirmation modal: edit the user's role
    function editUserRoleToggle(user_id, self) {
        $('#edit-user-role-modal').dialog({
            user_id: user_id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Editer": function () {
                    $(this).dialog("close");
                    // Make this select available
                    var list = $('tr#userid-' + user_id).find('select');
                    list.prop('disabled', false);
                    // Remove the parameters wheel
                    self.remove();
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
                $(this).empty();
            }
        }).append('<p>Souhaitez-vous éditer le rôle de cet utilisateur ?</p><i>Par mesure de sécurité, les champs sont verrouillés par défaut.</i>');
    };

    // Toggle the modal when we click on the "parameters" wheel
    $(document).on('click', '.edit-user-role-toggle', function () {
        var self = $(this);
        var user_id = $(this).parents('tr').attr('id').replace('userid-','');
        editUserRoleToggle(user_id, self);

        // Unbind the event
        self.off();
    });

    // Edit an user's role on click
    $(document).on('change', '.select-user-role', function () {
        var self = $(this);
        var role = self.val();
        var user_id = self.parents('tr').attr('id').replace('userid-','');

        // Send the query to the server
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'edit_user_role',
                role: role,
                id: user_id
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {
                    // Don't do anything
                } else {
                    displayErrorModal(response.error);
                }

            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
                displayErrorModal(response.error);
            }
        });

        // Unbind the event
        self.off();
    });

    /* 
    =================================================================
    Managing the application's collections
    =================================================================
    */
    // Create the JQueryUI sortable list
    $(function() {
        $('.collections-list').sortable({
            axis: "y",
            items: 'li:not(.ui-state-disabled)',
            placeholder: 'ui-state-highlight',
         });
        $('.collections-list').disableSelection();
    });

    // Update collections order with sortable list
    $('.collections-list').on('sortupdate', function (event, ui) {

        // Init empty array
        var collections_array = [];
        
        $(this).children().each(function (index) {
            // Get the collection's id
            var collection_id = $(this).attr('id').replace('collection-', '');
            // Get the collection's position
            var collection_index = index;

            // Make sure we only store the editable collections and not the "+" button (top and bottom of the list)
            if (collection_id !== 'add-collection') {

                // Store it in an object
                var collection = {
                    id: collection_id,
                    index: collection_index
                    };
    
                // Push this object in an array to send to the database
                collections_array.push(collection);
            }            
        });

        // Send this data to the database
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'update_collections_position',
                collections_array: collections_array
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {
                    // Don't do anything else
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#collections-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
                $('#collections-error-message').empty().append(response.error);
            }
        });
        
    });

    // Function to add a new "collection" element to the list
    function writeCollectionBlock(id, name) {
        var html = '<li id="collection-' + id + '" class="selectable ui-state-default ui-sortable-handle">' +
                   '<p>' + name + '</p>' +
                   '<a href="#" class="collection-parameters"><svg><use xlink:href="#iconeParameters" /></use></svg></a>' +
                   '</li>';
        return html;
    }

    // Function to load the collections from an array
    function loadCollections(collections) {

        // Loop through collections to append them to the html content
        for (let i = 0; i < collections.length; i++) {
          var id = collections[i].id;
          var name = collections[i].name;
    
          // Write the HTML code to display the collections
          // Make sure we don't add twice the "Aucune" collection (id = 1) wich is already there and disabled
          if (id != 1) {

            var html = writeCollectionBlock(id, name);
        
            // Append the content to the interface
            $(html).insertBefore('#collection-1'); 
          }   
        };
    };

    // Load all the collections
    $.ajax({
        url: './api.php',
        method: 'POST',
        async: true,
        data: {mode: 'collections'},
        dataType: 'json',
        beforeSend: function() {

            // Show a loader
            $('#collections-box .loader-container').show();

        },
        success: function(response) {
            // Check if an error happened or not
            if (response.success == true || response.error_code == 2) {

                // Empty error messages
                $('#collections-error-message').empty();

                // Load the list
                loadCollections(response.collections);

            } else {
                // Display the error
                console.error(response.error);
                $('#collections-error-message').empty().append(response.error);
            }

        },
        complete: function() {

            // Hide a loader
            $('#collections-box .loader-container').hide();

        },
        error: function(response) {
            console.error(response.error);
            $('#collections-error-message').empty().append(response.error);
        }
    });

    // Display the collection-parameters-menu when the user clicks on a collection's parameters button
    $(document).on('click', '.collection-parameters', function() {
        var self = $(this);

        // Hide the menu if the icon is clicked a second time
        if (self.hasClass('active') == true && $('.collection-parameters-menu').css('display') !== 'none') {
            self.removeClass('active');
            $('.collection-parameters-menu').hide();
            collectionToDelete = '';

        } else { // Display the menu

            // Remove active class from every element
            $('.collection-parameters').each(function() {
                $(this).removeClass('active');
            });

            // Activate this one and display it
            self.addClass('active');
            collectionToDelete = self.closest('li').attr('id').replace('collection-', '');
            var position = self.position();
            var left = position.left + 30;
            var top = position.top;
            $('.collection-parameters-menu').css({'left': left, 'top': top}).show();

        }
    });

    // Hide the menu if the user clicked somewhere else
    $(document).on('click', function (e) {
        var target = e.target;
        var is_coll_param = false;
        var is_coll_menu = false;

        // Check if the user clicked on a parameters wheel
        if ($(target).hasClass('collection-parameters') == true || $(target).parents('a').hasClass('collection-parameters') == true) {
            is_coll_param = true;
        }

        // Check if the user clicked on a collection's contextual menu
        if ($(target).parents('div').hasClass('collection-parameters-menu') == true) {
            is_coll_menu = true;
        }

        // If the user didn't click on a parameters wheel nor on a menu, hide the menu
        if (is_coll_param == false && is_coll_menu == false) {
            $('.collection-parameters-menu').hide();
        }
    });

    // Delete a collection
    function deleteCollection(id) {

        // Modal code (JqueryUI)
        $('#delete-collection-modal').dialog({
            id: id, // Adding the collection's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer": function () {

                    // Send the data to the database
                    $.ajax({
                        url: './admin_api.php',
                        method: 'POST',
                        async: true,
                        data: {
                            mode: 'delete_collection',
                            id: id
                        },
                        dataType: 'json',
                        beforeSend: function() {
                            // Do sth
                        },
                        success: function(response) {
    
                            // Check if an error happened or not
                            if (response.success == true) {
                
                                // Remove the collection's bow from the interface
                                $('#collection-' + id).remove();

                                // Close the dialog
                                $('#delete-collection-modal').dialog("close");
                                                
                            } else {
                                // Display the error
                                console.error(response.error);
                                displayErrorModal(response.error);
                            }
                
                        },
                        complete: function() {
                            // Do sth
                        },
                        error: function(response) {
                            console.error(response.error);
                            displayErrorModal(response.error);
                        }

                    }); // End of Ajax call

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
            }
        });
    };

    // Trigger the collection deletion
    $(document).on('click', '.menu-delete-collection', function () {

        // Fetch needed variables
        var target = $('.collection-parameters.active').parents('li');
        var id = target.attr('id').replace('collection-', '');

        // Delete the collection
        deleteCollection(id);
    });

    // Rename a collection
    function renameCollection(id, oldname) {

        // Display the old collection's name in the modal
        $('#edit-collection-name').val(oldname);

        // Modal code (JqueryUI)
        $('#edit-collection-name-modal').dialog({
            id: id, // Adding the collection's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer": function () {

                    // Get the field's value
                    var name = $('#edit-collection-name').val();

                    // Make sure the field isn't empty
                    if (!/\S/.test(name) || name == 'undefined') {

                        $('#edit-collection-name-modal .info-error').empty().html('Le nom ne peut pas être vide.');

                    } else {

                        // Delete error message
                        $('#edit-collection-name-modal .info-error').empty();

                        // Send the data to the database
                        $.ajax({
                            url: './admin_api.php',
                            method: 'POST',
                            async: true,
                            data: {
                                mode: 'edit_collection_name',
                                name: name,
                                id: id
                            },
                            dataType: 'json',
                            beforeSend: function() {
                                // Do sth
                            },
                            success: function(response) {

                                // Check if an error happened or not
                                if (response.success == true) {
                    
                                    // Empty error messages
                                    $('#edit-collection-name-modal .info-error').empty();

                                    // Update the collection's title on the interface
                                    $('#collection-' + id + ' p').empty().append(name);

                                    // Close the dialog
                                    $('#edit-collection-name-modal').dialog("close");
                                                    
                                } else {
                                    // Display the error
                                    console.error(response.error);
                                    $('#edit-collection-name-modal .info-error').empty().html(response.error);
                                }
                    
                            },
                            complete: function() {
                                // Do sth
                            },
                            error: function(response) {
                                console.error(response.error);
                                $('#edit-collection-name-modal .info-error').empty().html(response.error);
                            }
                        });
                    }
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
            }
        });
    };

    // Trigger the collection's rename from menu
    $(document).on('click', '.menu-rename-collection', function () {

        // Fetch needed variables
        var target = $('.collection-parameters.active').parents('li');
        var id = target.attr('id').replace('collection-', '');
        var currentname = target.find('p').html();

        // Rename the collection
        renameCollection(id, currentname);
    });


    // Add a new collection
    function addCollection() {

        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'add_collection'},
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {
    
                    // Empty error messages
                    $('#collections-error-message').empty();
    
                    // Add the new collection to the list
                    var html = writeCollectionBlock(response.id, '[new collection]');
        
                    // Append the content to the interface
                    $(html).insertBefore('#collection-1'); 

                    // Open the "rename" menu for the element with id = reponse.id
                    renameCollection(response.id, '[new collection]');

    
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#collections-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
                $('#collections-error-message').empty().append(response.error);
            }
        });

    }; // End of the function to add a new collection

    // Trigger the "add collection" with a click event
    $('#add-collection').click(function() {

        addCollection();

        // Update the element's position in the database
        $('.collections-list').trigger('sortupdate');

    });

    /* 
    =================================================================
    Displaying the layers sources list
    =================================================================
    */
    // Fetch all sources from the database
    function fetchSourcesFromDB() {

        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'fetch_sources'}, // Fetching sources from the database
            dataType: 'json',
            beforeSend: function() {

                // Show the loader
                $('#content-data-sources .loader-container').show();

                // Empty the table containers
                $('#sources-table-container').empty();

            },
            success: function(response) {
                // Check if an error happened or not

                if (response.success == true) {
   
                    // Turn the object into an array
                    var arrayOfSources = [];
                    for (let i = 0; i < response.sources.length; i++) {
                        
                        var row = [];

                        row.push(response.sources[i].id);
                        row.push(response.sources[i].name);
                        row.push(response.sources[i].url);
                        row.push(response.sources[i].type);

                        // Add buttons to the row
                        var buttons =
                            '<div class="table-button-container">' +
                            addButton('neutral add-layer-from-source', 'Ajouter une couche') +
                            addButton('neutral edit-data-source', 'Editer') +
                            addButton('negative delete-data-source', 'X') +
                            '</div>';

                        row.push(buttons);

                        arrayOfSources.push(row);
                    }

                    // Destroy the table and add a new one
                    var table_container = '<table id="sources-table" class="stripe"></table>';
                    $('#sources-table-container').append(table_container);

                    // Display the result as a table with dataTables
                    $('#sources-table').dataTable({
                        data: arrayOfSources,
                        columns: [
                            {title: "id"},
                            {title: "Name"},
                            {title: "URL"},
                            {title: "Type"},
                            {title: ""}
                        ],
                        columnDefs: [ // dataTables styling
                            {targets: 0, width: "20px"},
                            // Styling columns
                            {targets: 0, className: "source-id"},
                            {targets: 1, className: "source-name"},
                            {targets: 2, className: "source-url"},
                            {targets: 3, className: "source-type td-display-none"}, // Hide the "type" column (don't display it but still be able to fetch information from it)
                            {targets: 4, className: "source-buttons"}

                        ]
                    });
 
                    
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#sources-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Hide the loader
                $('#content-data-sources .loader-container').hide();
            },
            error: function(response) {
                console.error(response.error);
                $('#sources-error-message').empty().append(response.error);
            }
        });
    }

    fetchSourcesFromDB(); // Fetch sources from the database on application load

    /* 
    =================================================================
    Managing server types
    =================================================================
    */
    // Fetch the server types from the database
    function fetchServerTypesFromDB() {

        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'fetch_server_types'},
            dataType: 'json',
            success: function(response) {
                // Check if an error happened or not

                if (response.success == true) {

                    // Empty the current select options
                    $('#data-source-type').empty();
    
                    // Append the choices to the dropdown list in the modal
                    for (let i = 0; i < response.serverTypes.length; i++) {

                        var value  = response.serverTypes[i].id;
                        var type   = response.serverTypes[i].type;
                        var option = '<option value="' + value + '">' + type + '</option>';
                        $('#data-source-type').append(option);

                    }

                    // Show the button to add a new source
                    $('#add-data-source').show();
                    
                } else {
                    // Display the error
                    console.error(response.error);
                    displayErrorModal(response.error);
                }
    
            },
            error: function(response) {
                console.error(response.error);
                displayErrorModal(reponse.error);
            }
        });
    }

    fetchServerTypesFromDB(); // Fetch server types from the database on application load

    /* 
    =================================================================
    Data sources global interactions
    =================================================================
    */
    // Function to get data source id from clicked button
    function getDataSourceID(button) {
        var target = button.parents('tr').find('td:first-of-type').html();
        return target;
    }

    // Function to get url from server capabilities
    function extractURLfromCapabilities(capabilitiesUrl) {

        // Delete the GetCapabilities request
        var url = capabilitiesUrl.replace('REQUEST=GetCapabilities', '');
        var url = capabilitiesUrl.replace('request=GetCapabilities', '');

        if (url.slice(-1) == '&') {
            var result = url.slice(0, -1);
        } else {
            var result = url;
        }

        return result;
    }

    // Function to write getCapabilities query from url
    function writeCapabilitiesFromURL(url) {

        url = url.replace('&amp;', '&');
        var capabilities = url + ('&request=GetCapabilities');

        return capabilities;
    }

    // Function to save the new server source into the database / update a server source
    // To add a new source, don't enter any id
    // Example to add a new source: updateServerSource('https://mydomain.fr/', 3, 'My Domain');
    // Example to update the 5th source: updateServerSource('https://mydomain.fr/', 3, 'My Domain', 5);
    function updateServerSource(url, serverType, name, id) {

        // Check if we add a new server or update information (if 'id' is set, update)
        if (typeof id !== 'undefined') {
            var mode = 'update_server';
        } else {
            var mode = 'add_new_server';
        }

        // Send the data to the server
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: mode,
                url: url,
                type: serverType,
                name: name,
                id: id
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loader
                $('#data-source-config-panel .loader-container').show();

                // Temporarily hide the table
                $('#data-source-preview-container').hide();

                // Disable the "Test connexion" and "Confirm" buttons
                $(".ui-dialog-buttonpane button:contains('Tester la connexion')").button("disable");
                $(".ui-dialog-buttonpane button:contains('Confirmer')").button("disable");

            },
            success: function(response) {              

                if (response.success == true) {

                    // Display a message
                    displayMessageModal('Liste des serveurs mise à jour avec succès.');

                    // Update the source list table
                    fetchSourcesFromDB();
                    
                } else {                    
                    console.error(response.error);
                    displayErrorModal(response.error);
                }

            },
            error: function() {

                console.error(response.error);
                displayErrorModal(response.error);

            },
            complete: function() {

                // Hide the loader
                $('#data-source-config-panel .loader-container').hide();

                // Show the table
                $('#data-source-preview-container').show();

                // Enable the "Test connexion" and "Confirm" buttons
                $(".ui-dialog-buttonpane button:contains('Tester la connexion')").button("enable");
                $(".ui-dialog-buttonpane button:contains('Confirmer')").button("enable");

            }

        });

    }

    // Source config modal
    function dataSourceConfigPanel(id) {

        // Modal code (JqueryUI)
        $('#data-source-config-panel').dialog({
            id: id, // Adding the collection's id when the function is called
            resizable: true,
            minWidth: 680,
            maxHeight: 600,
            modal: true,
            buttons: {
                "Tester la connexion": function() {

                    // Get the url from the field
                    var url = $('#data-source-capabilities').val();

                    // Displaying the preview in the modal to see if it is working
                    dataSourceGetCapabilities(url, 'test');

                },
                "Confirmer": function () {

                    // Empty the error message
                    $('#data-source-config-panel .info-error').empty();

                    // Get the capabilities url from the field
                    var capabilitiesUrl = $('#data-source-capabilities').val();

                    // Deconstruct the capabilities to extract the server's url
                    var url = extractURLfromCapabilities(capabilitiesUrl);
                    var urlTest = checkIfEmpty(url);

                    // Get the server type id
                    var serverType = $('#data-source-type').val();

                    // Get the name and make sure it isn't empty or doesn't contain any spaces
                    var name = $('#data-source-name').val();
                    var nameTest = checkIfEmpty(name);

                    // If the name and the url is okay, process, if not, send an error message
                    if (nameTest == false || urlTest == false) {       

                        $('#data-source-config-panel .info-error').html('Le nom de la source et l\'url ne doivent pas être vides.');
                        validation = false;

                    } else { // We can send the data to the database and save it

                        // Update information
                        updateServerSource(url, serverType, name, id);

                    }

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            open: function() {

                //Empty the error message
                $('#data-source-config-panel .info-error').empty();

            },
            close: function () {

                // Empty the fields
                $('#data-source-capabilities').val('');
                $('#data-source-name').val('');
                $('#data-source-type').val(1);

                // Empty the table
                $('#data-source-preview-container').empty();

            }
        });
    };

    /* 
    =================================================================
    Add a new data source
    =================================================================
    */
    // Block the "Confirmer" button when the user changed the capabilities value so he has to test before saving
    $('#data-source-capabilities').on('keyup', function() {
        $(".ui-dialog-buttonpane button:contains('Confirmer')").button("disable");
    });

    // Fonction wrapping the ajax query to get the source's capabilities
    // `type` must match the type of query we do: testing the connexion or actually fetching the data from the server?
    // `type` can be "fetch" (we fetch the capabilities "for real") or equal to "test" (we fetch for testing the connexion)
    function dataSourceGetCapabilities(url, type, id) {

        // If type != 'fetch' then give it a 'test' value
        if (type != 'fetch') {
            type = 'test';
        }

        // Fetch capabilities
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'fetch_capabilities',
                url: url,
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loaders
                $('#data-source-config-panel .loader-container').show();
                $('#list-layers-from-source .loader-container').show();

                // Empty the table containers
                $('#data-source-preview-container').empty();
                $('#list-layers-from-source-container').empty();

                // Empty the error messages
                $('#data-source-config-panel .info-error').empty();
                $('#list-layers-from-source .info-error').empty();

                // Disable the "Test connexion" button TODO
                $(".ui-dialog-buttonpane button:contains('Tester la connexion')").button("disable");

            },
            success: function(response) {

                // Check if everything worked
                if (response.xml) {

                    // Fetching the data we need: all available layers
                    var xml = response.xml;
                    var capabilities = xml.Capability;
                    var arrayOfLayers = capabilities.Layer.Layer;

                    // Check if we can dig deeper into the response
                    // If yes, for now, ask the user to use the local GeoServer instance to redirect the flux
                    var test_capabilities = arrayOfLayers[0].Layer;
                    
                    if (test_capabilities) { // We didn't reach the layers since we can go deeper, display an error message

                        // Get current domain url
                        var current_url = window.location.href;

                        // Write the url leading to the local GeoServer instance
                        var geoserver_url = current_url.split('/map/')[0] + '/geoserver/';

                        // Display the error in the console
                        console.error("Couldn't fetch capabilities from source");

                        var message = '<p>NAMO ne peut pas encore lire les Capabilities comprenant des couches imbriquées. Veuillez passer par l\'<a href="' + geoserver_url + '" target="_blank">instance locale de GeoServer</a> pour rediriger le flux WMS, puis revenir ici pour ajouter les couches depuis votre GeoServer local.</p>';
                        $('#data-source-config-panel .info-error').html(message);
                        
                    } else { // We can read the Capabilities

                        // Enable the "Confirmer" button so the user can now save the source
                        $(".ui-dialog-buttonpane button:contains('Confirmer')").button("enable");

                        // Fill up the table
                        var table = [];
                        for (let i = 0; i < arrayOfLayers.length; i++) {

                            var row = [];

                            var layer = arrayOfLayers[i];
                            
                            var name = layer.Name;
                            var title = layer.Title;

                            row.push(name);
                            row.push(title);

                            table.push(row);

                        }

                        // Check if we want to display a preview for checking or actually fetching the data
                        if (type == 'test') {

                            // Destroy the table and add a new one
                            var table_container = '<table id="data-source-preview" class="stripe"></table>';
                            $('#data-source-preview-container').append(table_container);

                            // Display the preview in the data source config panel modal
                            $('#data-source-preview').dataTable({
                                data: table,
                                searching: false,
                                "iDisplayLength": 5,
                                "aLengthMenu": [[5, 10, 15, -1], [5, 10, 15, "All"]],
                                columns: [
                                    {title: "Name"},
                                    {title: "Title"}
                                ]
                            });
                            
                        } else if (type == 'fetch') {

                            // Call another function to check if a layer is published or not and display the table
                            checkIfLayersArePublished(id, table); // TODOS

                        }
                    }

                } else { // Display error messages 

                    // Display the error in the console
                    console.error("Couldn't fetch capabilities from source");

                    // Display error message
                    var message = '<p>Impossible de récupérer des données. Vérifiez que l\'adresse du serveur est la bonne et que vous utilisez bien la version 1.3.0 de getCapabilities. Sinon, essayez de rafraîchir l\'application.</p>';
                    $('#data-source-config-panel .info-error').html(message);
                    $('#list-layers-from-source .info-error').html(message);

                }

            },
            error: function() {

                // Display the error in the console
                console.error("Couldn't fetch capabilities from source");

                if (type == 'test') { // Display the error message in the config modal
                    
                    var message = '<p>Impossible de récupérer des données. Vérifiez que l\'adresse du serveur est la bonne et que vous utilisez bien la version 1.3.0 de getCapabilities. Sinon, essayez de rafraîchir l\'application.</p>';
                    $('#data-source-config-panel .info-error').html(message);

                } else { // Display the error message in the add layer modal
                    
                    var message = '<p>Impossible de récupérer des données. Vérifiez que l\'adresse du serveur est la bonne et que vous utilisez bien la version 1.3.0 de getCapabilities. Sinon, essayez de rafraîchir l\'application.</p>';
                    $('#list-layers-from-source .info-error').html(message);

                }

                // Hide a loader only if error
                $('#list-layers-from-source .loader-container').hide();
                
            },
            complete: function() {

                // Hide the loaders
                $('#data-source-config-panel .loader-container').hide();
                $('#list-layers-from-source .loader-container').hide();

                // Center the modal
                if (type == 'fetch') {
                    $('#list-layers-from-source').dialog("option", "position", {my: "center", at: "center", of:window});
                } else {
                    $('#data-source-config-panel').dialog("option", "position", {my: "center", at: "center", of:window});
                }

                // Enable the "Test connexion" button TODO
                $(".ui-dialog-buttonpane button:contains('Tester la connexion')").button("enable");

            }

        });

    }

    // Trigger: add a new source to the application
    $('#add-data-source').click(function() {

        // Add the source's elements by opening the source config modal
        dataSourceConfigPanel();

        // Block the "confirmer" button until the user passed the test
        $(".ui-dialog-buttonpane button:contains('Confirmer')").button("disable");

    });

    /* 
    =================================================================
    Edit the selected data source
    =================================================================
    */
    // Edit the data source
    $(document).on('click', '#sources-table .edit-data-source', function() {

        var self = $(this);
        var id = getDataSourceID(self);

        // Get the name, url and type of the selected source
        var name = self.parents('tr').find('.source-name').html();
        var url = self.parents('tr').find('.source-url').html().replace('&amp;', '&');
        var capabilities = writeCapabilitiesFromURL(url);
        var type = self.parents('tr').find('.source-type').html();

        // Display the source's name, url and type in the config modal
        $('#data-source-capabilities').val(capabilities);
        $('#data-source-name').val(name);
        $('#data-source-type').val(type);

        // Edit the source's elements by opening the source config modal
        dataSourceConfigPanel(id);

    });

    /* 
    =================================================================
    Delete a data source
    =================================================================
    */
    // Function to delete a server source from the the database
    function deleteServerSource(id) {

        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'delete_server',
                id: id
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loader
                $('#data-source-deletion-panel .loader-container').show();

                // Temporarily hide the table
                $('#data-source-preview-container').hide();

                // Disable the button
                $(".ui-dialog-buttonpane button:contains('Confirmer la suppression')").button("disable");

            },
            success: function(response) {              

                if (response.success == true) {

                    // Close the source deletion panel
                    $('#data-source-deletion-panel').dialog("close");

                    // Display a message
                    displayMessageModal('Le serveur et ses couches ont bien été supprimés de l\'application.');

                    // Update the source list table
                    fetchSourcesFromDB();

                    // Reload the layers list too since we added a new one
                    fetchLayersFromDB();
                    
                } else {                    
                    console.error(response.error);
                    displayErrorModal(response.error);
                }

            },
            error: function() {

                console.error(response.error);
                displayErrorModal(response.error);

            },
            complete: function() {

                // Hide the loader
                $('#data-source-deletion-panel .loader-container').hide();

                // Show the table
                $('#data-source-preview-container').hide();

                // Enable the button
                $(".ui-dialog-buttonpane button:contains('Confirmer la suppression')").button("enable");

            }

        });

    }

    // Modal for deleting a data source
    function sourceDeletionPanel(id) {
        $('#data-source-deletion-panel').dialog({
            id: id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer la suppression": function () {
                    // Send the information to the server
                    deleteServerSource(id);
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            }
        });
    };

    // Delete a data source
    $(document).on('click', '#sources-table .delete-data-source', function() {

        var self = $(this);
        var id = getDataSourceID(self);

        // Display the confirmation modal for deleting a source in the database
        sourceDeletionPanel(id);
        
    });

    /* 
    =================================================================
    Add a new layer from the data source
    =================================================================
    */
    // Function to check if the layers are published
    function checkIfLayersArePublished(id, table) {

        // Send data to the database
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'list_published_layers_by_server',
                id: id
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loader
                $('#list-layers-from-source .loader-container').show();

            },
            success: function(response) {              

                if (response.success == true) {

                    // Store the published layers in a variable
                    var arrayOfLayers = response.arrayOfLayers;

                    // Loop through all data elements
                    for (let i = 0; i < table.length; i++) {
                        
                        var published = false;  // Used to know if the layer is published or not
                        var name = table[i][0]; // Layer's name (from the remote server)
                        
                        // Check if the values matches one in the "published" layers in the database
                        for (let j = 0; j < arrayOfLayers.length; j++) {
                            
                            var database_name = arrayOfLayers[j].name; // Layer's name (from the local database)

                            // If they match, the layer is already published, just show a message "layer already published"
                            if (name == database_name) {                              
                                published = true;
                            }
                            
                        }

                        // Then check 'published' value and append a new message / button to the table
                        if (published == true) { // The layer is already published, display a message

                            var html = '<p><i>Déjà disponible</i></p>';

                        } else { // The layer is not published yet, add a "publish" button

                            var html =  '<div class="table-button-container">' +
                                        addButton('neutral publish-layer', 'Ajouter') +
                                        '</div>';
                            
                        }

                        table[i].push(html);

                    }

                    // Destroy the table and add a new one
                    var table_container = '<table id="list-layers-from-source-table" class="stripe"></table>';
                    $('#list-layers-from-source-container').append(table_container);

                    // Display the preview in the data source config panel modal
                    $('#list-layers-from-source-table').dataTable({
                        data: table,
                        columns: [
                            {title: "Name"},
                            {title: "Title"},
                            {title: ""}
                        ],
                        columnDefs: [ //dataTables styling
                            {targets: 0, className: "layer-name"},
                            {targets: 1, className: "layer-title"},
                            {targets: 2, className: "layer-buttons"}
                        ]
                    });
                    
                } else {                    
                    console.error(response.error);
                    displayErrorModal(response.error);
                }

            },
            error: function() {

                console.error(response.error);
                displayErrorModal(response.error);

            },
            complete: function() {

                // Hide the loader
                $('#list-layers-from-source .loader-container').hide();

            }

        });

    }

    // Define an object in which to store the current used source 
    var current_source = {
        id: 0,
        name: '',
        url: ''
    };

    // Modal for adding a new layer form a data source
    function listLayersFromSource(url, type, id) {

        // Write the modal
        $('#list-layers-from-source').dialog({
            url: url,    // Capabilities url to fetch layers from
            type: type,  // Type of GetCapabilities ('fetch' or 'test')
            id: id,      // Source id
            resizable: true,
            minWidth: 680,
            height: 480,
            modal: true,
            buttons: {
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            open: function() {
                
                // Get capabilities from the data source
                dataSourceGetCapabilities(url, type, id);

            },
            close: function () {
            }
        });

    };

    // Add a new layer from a data source
    $(document).on('click', '#sources-table .add-layer-from-source', function() {

        var self = $(this);
        var id = getDataSourceID(self);

        // Get the id, name, url and type of the selected source
        var name = self.parents('tr').find('.source-name').html();
        var url = self.parents('tr').find('.source-url').html().replace('&amp;', '&');

        var capabilities = writeCapabilitiesFromURL(url);

        // Store all the informations in current_source
        current_source.id   = id;
        current_source.name = name;
        current_source.url  = url;

        // List all the layers from this source
        listLayersFromSource(capabilities, 'fetch', id);

    });

    /* 
    =================================================================
    Edit layer modal
    =================================================================
    */
    // Function to send the layer's information to the server for update
    function sendLayerUpdate(layer) {

        // Define the mode bewteen save_new_layer or update_layer_infos
        // If id is indefined = new layer
        var id = layer.layer_id;
        if (id) {
            var mode = "update_layer_infos";
        } else {
            var mode = "save_new_layer";
        }

        // Send the ajax query to the database
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: mode,
                layer_id: layer.layer_id,
                source_id: layer.source_id,
                name: layer.name,
                title: layer.title,
                theme: layer.theme,
                opacity: layer.opacity,
                zIndex: layer.zIndex
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loader
                $('#edit-layer-modal .loader-container').show();

                // Disable the "send" button
                $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("disable");

            },
            success: function(response) {    
                
                if (response.success == true) {

                    // It worked, reload the table
                    var id           = current_source.id;
                    var url          = current_source.url;
                    var capabilities = writeCapabilitiesFromURL(url);

                    dataSourceGetCapabilities(capabilities, 'fetch', id);

                    // Reload the layers list too since we added a new one
                    fetchLayersFromDB();

                    // Close the "edit layer" modal
                    $('#edit-layer-modal').dialog("close");

                    // Display a confirmation message
                    displayMessageModal('Base de données mise à jour avec succès.');
                    
                } else {                    
                    console.error(response.error);
                    displayErrorModal(response.error);
                }

            },
            error: function() {

                console.error(response.error);
                displayErrorModal(response.error);

            },
            complete: function() {

                // Hide the loader
                $('#edit-layer-modal .loader-container').hide();

                // Enable the "send" button
                $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("enable");

            }

        });

    }

    // Modal for editing a layer
    // The "id" can be undefined if we are adding a new layer and not editing an existing one
    function editLayer(name, title, id) {

        var layer_id   = id;
        var layer_name = name;
        var source_id  = current_source.id;

        // Write the modal
        $('#edit-layer-modal').dialog({
            id: layer_id,               // Layer id if we edit an existing layer
            layer_name: layer_name,     // Layer name
            source_id: source_id,
            resizable: true,
            minWidth: 480,
            height: 480,
            modal: true,
            buttons: {
                "Enregistrer": function() {

                    // Empty the error message
                    $('#edit-layer-modal .info-error').empty();

                    // Fetch all the needed values
                    var layer_id  = id;
                    var source_id = current_source.id;
                    var name      = layer_name;
                    var title     = $('#layer-title-field').val();
                    var theme     = $('#layer-theme-field').val();
                    var opacity   = $('#layer-opacity-field').val();
                    var zIndex    = $('#layer-zIndex-field').val();

                    // Validate all the fields
                    var valid = true;
                    var error_message = '';

                    // Title not null
                    var valid_title = checkIfEmpty(title);
                    if (valid_title == false) {
                        valid = false;
                        error_message = error_message + "Le titre d'une couche ne peut pas être vide.<br>";
                    }

                    // Opacity between 0 and 1
                    if (opacity < 0 || opacity > 1) {
                        valid = false;
                        error_message = error_message + "L'opacité doit être comprise entre 0 et 1.<br>";
                    }

                    // zIndex between 0 and 9000
                    if (zIndex < 0 || zIndex > 9000) {
                       valid = false; 
                       error_message = error_message + "Le zIndex doit être compris entre 0 et 9000.<br>";
                    }

                    // Check if the fields are valid
                    if (valid == true) {
                        
                        // Store all the needed values in an object to send to the ajax query
                        var layer = {
                            layer_id: layer_id,
                            source_id: source_id,
                            name: name,
                            title: title,
                            theme: theme,
                            opacity: opacity,
                            zIndex: zIndex
                        }

                        // Send the data to the server
                        sendLayerUpdate(layer);

                    } else { // Display an error message
                        $('#edit-layer-modal .info-error').append(error_message);
                    }

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            open: function () {

                // Test if "id" is defined              
                // Display the informations in the modal
                if (id) { // We're editing an existing layer, fetch informations from the database
                    
                    // Fetch the informations from the server and display it in the modal
                    updateLayerDataModalInfo(id);

                } else { // We're adding a new layer, display its name, the source and the default values

                    // Empty the error message
                    $('#edit-layer-modal .info-error').empty();

                    // Display the loader
                    $('#edit-layer-modal .loader-container').show();

                    // Hide the layer data fields
                    $('#edit-layer-modal .wrapper').hide();

                    // Disable the button
                    $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("disable");
                    
                    // Update the fields' values
                    $('#layer-name-field').html(name);
                    $('#layer-source-field').html(current_source.name);
                    $('#layer-title-field').val(title);
                    $('#layer-theme-field').val(1);
                    $('#layer-opacity-field').val(1);
                    $('#layer-zIndex-field').val(0);

                    // Hide the loader
                    $('#edit-layer-modal .loader-container').hide();

                    // Show the layer data fields
                    $('#edit-layer-modal .wrapper').show();

                    // Enable the button
                    $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("enable");

                }
                
            },
            close: function () {
                $(this).dialog("close");
            }
        });

    };


    // If the user clicks on a button to add a new layer, open the edit layer modal
    $(document).on('click', '#list-layers-from-source .publish-layer', function() {

        var self  = $(this);
        var name  = self.parents('tr').find('.layer-name').html();
        var title = self.parents('tr').find('.layer-title').html();

        // Display the layer edition modal
        editLayer(name, title);

    });

    // If the user needs more information on the layer opacity field:
    $('#layer-opacity-info').click(function() {

        var message = "<p>Ce champ correspond à l'opacité par défaut de la couche lorsque l'application charge. " +
            "Ce champ peut toujours être modifié par l'utilisateur par la suite. " +
            "<br>(1 = couche visible, 0 = couche transparente)</p>";

        displayMessageModal(message);

    });

    // If the user needs more information on the layer zIndex field:
    $('#layer-zIndex-info').click(function() {

        var message = "<p>Ce champ correspond au zIndex de la couche et permet de régler leur ordre d'affichage sur la carte. " +
            "Une valeur élevée fera s'afficher la couche par-dessus les autres, une valeur faible la fera s'afficher en-dessous.<br>" +
            "Nous vous conseillons de savoir ce que vous faites avant de modifer cette valeur, sinon laissez-la par défaut." +
            "<p><b>Nous vous conseillons quelques valeurs ci-dessous pour vous guider :</b>" +
                "<ul>" +
                    "<li><b>0</b> pour les couches de polygones à couverture importante (ex: emprise d'un pays)</li>"+
                    "<li><b>50</b> pour les couches de polygones à couverture plus faible ou plus éparses, les lignes, etc.</li>"+
                    "<li><b>100</b> pour les couches de points, les flèches, etc.</li>"+
                "</ul>" +
            "</p>" +
            "<p>Pour plus d'informations : <a href='https://openlayers.org/en/latest/apidoc/module-ol_layer_Layer-Layer.html#setZIndex' target='_blank'>zIndex dans la documentation OpenLayers</a></p>";

        displayMessageModal(message);

    });

    /* 
    =================================================================
    Load the layers from the database
    =================================================================
    */
    function fetchLayersFromDB() {

        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'list_published_layers'},
            dataType: 'json',
            beforeSend: function() {

                // Show the loader
                $('#layers-table-loader .loader-container').show();

                // Empty the table containers
                $('#layers-table-container').empty();

            },
            success: function(response) {
                // Check if an error happened or not

                if (response.success == true) {
   
                    // Turn the object into an array
                    var arrayOfLayers = [];
                    for (let i = 0; i < response.layers.length; i++) {
                        
                        var row = [];

                        row.push(response.layers[i].id);
                        row.push(response.layers[i].server);
                        row.push(response.layers[i].server_name);
                        row.push(response.layers[i].name);
                        row.push(response.layers[i].title);
                        row.push(response.layers[i].theme);
                        row.push(response.layers[i].theme_name);
                        row.push(response.layers[i].opacity);
                        row.push(response.layers[i].zIndex);

                        // Add buttons to the row
                        var buttons =
                            '<div class="table-button-container">' +
                            addButton('neutral edit-data-layer', 'Editer') +
                            addButton('negative delete-data-layer', 'X') +
                            '</div>';

                        row.push(buttons);
                        arrayOfLayers.push(row);
                    }

                    // Destroy the table and add a new one
                    var table_container = '<table id="layers-table" class="stripe"></table>';
                    $('#layers-table-container').append(table_container);

                    // Display the result as a table with dataTables
                    $('#layers-table').dataTable({
                        data: arrayOfLayers,
                        columns: [
                            {title: "id"},
                            {title: "server"},
                            {title: "server_name"},
                            {title: "name"},
                            {title: "title"},
                            {title: "theme"},
                            {title: "theme_name"},
                            {title: "opacity"},
                            {title: "zIndex"},
                            {title: ""}
                        ],
                        columnDefs: [ // dataTables styling
                            {targets: 0, width: "20px"},
                            // Styling columns
                            {targets: 0, className: "layers-id"},
                            {targets: 1, className: "layers-server td-display-none"},
                            {targets: 2, className: "layers-server-name"},
                            {targets: 3, className: "layers-name"},
                            {targets: 4, className: "layers-title"},
                            {targets: 5, className: "layers-theme td-display-none"},
                            {targets: 6, className: "layers-theme-name"},
                            {targets: 7, className: "layers-opacity td-display-none"},
                            {targets: 8, className: "layers-zIndex td-display-none"},
                            {targets: 9, className: "layers-buttons"}

                        ]
                    });
 
                    
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#layers-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Hide the loader
                $('#layers-table-loader .loader-container').hide();
            },
            error: function(response) {
                console.error(response.error);
                $('#layers-error-message').empty().append(response.error);
            }
        });
    }

    // Fetch the layers from the database when the application loads
    fetchLayersFromDB();

    /* 
    =================================================================
    Edit a layer with the "edit" button
    =================================================================
    */
    // Fetch the layer's informations from the database and display it in the layer data modal
    function updateLayerDataModalInfo(id) {
        
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'fetch_unique_layer',
                id: id
            },
            dataType: 'json',
            beforeSend: function() {

                // Empty the error message
                $('#edit-layer-modal .info-error').empty();

                // Display the loader
                $('#edit-layer-modal .loader-container').show();

                // Hide the layer data fields
                $('#edit-layer-modal .wrapper').hide();

                // Disable the button
                $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("disable");

            },
            success: function(response) {
                // Check if an error happened or not

                if (response.success == true) {

                    var layer = response.layer;
   
                    // Update the modal's field with the informations fetched from the database
                    $('#layer-name-field').html(layer.name);
                    $('#layer-source-field').html(layer.server_name);
                    $('#layer-title-field').val(layer.title);
                    $('#layer-theme-field').val(layer.theme);
                    $('#layer-opacity-field').val(layer.opacity);
                    $('#layer-zIndex-field').val(layer.zIndex);

                    // Define the new current source
                    current_source.id   = layer.server;
                    current_source.name = layer.server_name;
                    current_source.url  = layer.server_url;
                    
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#edit-layer-modal .info-error').empty().append(response.error);
                }
    
            },
            complete: function() {

                // Hide the loader
                $('#edit-layer-modal .loader-container').hide();

                // Show the layer data fields
                $('#edit-layer-modal .wrapper').show();

                // Enable the button
                $(".ui-dialog-buttonpane button:contains('Enregistrer')").button("enable");

            },
            error: function(response) {
                console.error(response.error);
                $('#edit-layer-modal .info-error').empty().append(response.error);
            }
        });


    }

    // Trigger
    $(document).on('click', '#layers-table .edit-data-layer', function() {

        var self = $(this);
        var id = getDataSourceID(self);

        // Get the name of this layer
        var name  = self.parents('tr').find('.layers-name').html();
        var title = self.parents('tr').find('.layers-title').html();

        // Edit the layer's informations
        editLayer(name, title, id);

    });

    /* 
    =================================================================
    Delete a layer
    =================================================================
    */
    // Function to delete a server source from the the database
    function deleteLayer(id) {

        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'delete_layer',
                id: id
            },
            dataType: 'json',
            beforeSend: function() {

                // Display the loader
                $('#data-layer-deletion-panel .loader-container').show();

                // Temporarily hide the table
                $('#data-layer-preview-container').hide();

                // Disable the button
                $(".ui-dialog-buttonpane button:contains('Confirmer la suppression')").button("disable");

            },
            success: function(response) {              

                if (response.success == true) {

                    // Hide the source deletion panel
                    $('#data-layer-deletion-panel').dialog("close");

                    // Display a message
                    displayMessageModal('La couche a bien été retirée de l\'application.');

                    // Reload the layers list
                    fetchLayersFromDB();
                    
                } else {                    
                    console.error(response.error);
                    displayErrorModal(response.error);
                }

            },
            error: function() {

                console.error(response.error);
                displayErrorModal(response.error);

            },
            complete: function() {

                // Hide the loader
                $('#data-layer-deletion-panel .loader-container').hide();

                // Show the table
                $('#data-layer-preview-container').hide();

                // Enable the button
                $(".ui-dialog-buttonpane button:contains('Confirmer la suppression')").button("enable");

            }

        });

    }

    // Modal for deleting a data source
    function layerDeletionPanel(id) {
        $('#data-layer-deletion-panel').dialog({
            id: id, // Adding the user's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer la suppression": function () {
                    // Send the information to the server
                    deleteLayer(id);
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            open: function() {
                // Hide the loader
                $('#data-layer-deletion-panel .loader-container').hide();
            },
            close: function () {
            }
        });
    };

    // Delete a layer
    $(document).on('click', '#layers-table .delete-data-layer', function() {

        var self = $(this);
        var id = getDataSourceID(self);

        // Display the confirmation modal for deleting a source in the database
        layerDeletionPanel(id);
        
    });

    /* 
    =================================================================
    Managing the application's themes
    =================================================================
    */
    // Create the JQueryUI sortable list
    $(function() {
        $('.themes-list').sortable({
            axis: "y",
            items: 'li:not(.ui-state-disabled)',
            placeholder: 'ui-state-highlight',
         });
        $('.themes-list').disableSelection();
    });

    // Update collections order with sortable list
    $('.themes-list').on('sortupdate', function (event, ui) {

        // Init empty array
        var themes_array = [];
        
        $(this).children().each(function (index) {
            // Get the collection's id
            var theme_id = $(this).attr('id').replace('theme-', '');
            // Get the collection's position
            var theme_index = index;

            // Make sure we only store the editable collections and not the "+" button (top and bottom of the list)
            if (theme_id !== 'add-theme') {

                // Store it in an object
                var theme = {
                    id: theme_id,
                    index: theme_index
                    };
    
                // Push this object in an array to send to the database
                themes_array.push(theme);
            }            
        });

        // Send this data to the database
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {
                mode: 'update_themes_position',
                themes_array: themes_array
            },
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {
                    // Don't do anything else
                } else {
                    // Display the error
                    console.error(response.error);
                    $('#themes-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
                $('#themes-error-message').empty().append(response.error);
            }
        });
        
    });

    // Function to add a new "theme" element to the list
    function writeThemeBlock(id, name) {
        var html = '<li id="theme-' + id + '" class="selectable ui-state-default ui-sortable-handle">' +
                   '<p>' + name + '</p>' +
                   '<a href="#" class="theme-parameters"><svg><use xlink:href="#iconeParameters" /></use></svg></a>' +
                   '</li>';
        return html;
    }

    // Function to load the themes from an array
    function loadThemes(themes) {

        // Loop through collections to append them to the html content
        for (let i = 0; i < themes.length; i++) {
          var id = themes[i].id;
          var name = themes[i].name;
    
          // Write the HTML code to display the themes
          // Make sure we don't add twice the "Autres" theme (id = 1) wich is already there and disabled
          if (id != 1) {

            var html = writeThemeBlock(id, name);
        
            // Append the content to the interface
            $(html).insertBefore('#theme-1'); 
          }   
        };

        // Add these elements to the <select> field for giving layers a theme
        fillLayersThemesSelect();

    };

    // Function to write the dropdown list to select the layer's theme from layers-box (faster than fetching from the database each time)
    function fillLayersThemesSelect() {

        // Empty the <select> element
        $('#layer-theme-field').empty();
        
        // For each <li> element in themes-list, write an option and append to the <select>
        $('#themes-list li').each(function() {

            var self  = $(this);
            var id    = self.attr('id').replace('theme-', '');
            var theme = self.find('p').html();

            // Write and append a new option except for the add-theme button
            if (id !== 'add-theme') {
                var option = '<option value="' + id + '">' + theme + '</option>';
                $('#layer-theme-field').append(option);
            }
        });
    }

    // Load all the themes
    function fetchAllThemes() {

        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'fetch_themes'},
            dataType: 'json',
            beforeSend: function() {
                
                // Display a loader
                $('#themes-box .loader-container').show();

            },
            success: function(response) {

                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {

                    // Empty error messages
                    $('#themes-error-message').empty();

                    // Load the list
                    loadThemes(response.themes);

                } else {
                    // Display the error
                    console.error(response.error);
                    $('#themes-error-message').empty().append(response.error);
                }

            },
            complete: function() {
                
                // Hide a loader
                $('#themes-box .loader-container').hide();

            },
            error: function(response) {
                console.error(response.error);
                $('#themes-error-message').empty().append(response.error);
            }
        });

    };

    // Load all themes on application load
    fetchAllThemes();

    // Store the theme to delete
    var themeToDelete = '';

    // Display the collection-parameters-menu when the user clicks on a collection's parameters button
    $(document).on('click', '.theme-parameters', function() {
        var self = $(this);

        // Hide the menu if the icon is clicked a second time
        if (self.hasClass('active') == true && $('.theme-parameters-menu').css('display') !== 'none') {
            self.removeClass('active');
            $('.theme-parameters-menu').hide();
            themeToDelete = '';

        } else { // Display the menu

            // Remove active class from every element
            $('.theme-parameters').each(function() {
                $(this).removeClass('active');
            });

            // Activate this one and display it
            self.addClass('active');
            themeToDelete = self.closest('li').attr('id').replace('theme-', '');
            var position = self.position();
            var left = position.left + 30;
            var top = position.top;
            $('.theme-parameters-menu').css({'left': left, 'top': top}).show();

        }
    });

    // Hide the menu if the user clicked somewhere else
    $(document).on('click', function (e) {
        var target = e.target;
        var is_coll_param = false;
        var is_coll_menu = false;

        // Check if the user clicked on a parameters wheel
        if ($(target).hasClass('theme-parameters') == true || $(target).parents('a').hasClass('theme-parameters') == true) {
            is_coll_param = true;
        }

        // Check if the user clicked on a theme's contextual menu
        if ($(target).parents('div').hasClass('theme-parameters-menu') == true) {
            is_coll_menu = true;
        }

        // If the user didn't click on a parameters wheel nor on a menu, hide the menu
        if (is_coll_param == false && is_coll_menu == false) {
            $('.theme-parameters-menu').hide();
        }
    });

    // Delete a collection
    function deleteTheme(id) {

        // Modal code (JqueryUI)
        $('#delete-theme-modal').dialog({
            id: id, // Adding the theme's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer": function () {

                    // Send the data to the database
                    $.ajax({
                        url: './admin_api.php',
                        method: 'POST',
                        async: true,
                        data: {
                            mode: 'delete_theme',
                            id: id
                        },
                        dataType: 'json',
                        beforeSend: function() {
                            // Do sth
                        },
                        success: function(response) {
    
                            // Check if an error happened or not
                            if (response.success == true) {
                
                                // Remove the theme's box from the interface
                                $('#theme-' + id).remove();

                                // Update the <select> field for giving layers a theme
                                fillLayersThemesSelect();

                                // Reload the layers list
                                fetchLayersFromDB();

                                // Close the dialog
                                $('#delete-theme-modal').dialog("close");
                                                
                            } else {
                                // Display the error
                                console.error(response.error);
                                displayErrorModal(response.error);
                            }
                
                        },
                        complete: function() {
                            // Do sth
                        },
                        error: function(response) {
                            console.error(response.error);
                            displayErrorModal(response.error);
                        }

                    }); // End of Ajax call

                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {
            }
        });
    };

    // Trigger the theme deletion
    $(document).on('click', '.menu-delete-theme', function () {

        // Fetch needed variables
        var target = $('.theme-parameters.active').parents('li');
        var id = target.attr('id').replace('theme-', '');

        // Delete the theme
        deleteTheme(id);
    });

    // Rename a theme
    function renameTheme(id, oldname) {

        // Display the old collection's name in the modal
        $('#edit-theme-name').val(oldname);

        // Modal code (JqueryUI)
        $('#edit-theme-name-modal').dialog({
            id: id, // Adding the collection's id when the function is called
            resizable: false,
            width: 400,
            modal: true,
            buttons: {
                "Confirmer": function () {

                    // Get the field's value
                    var name = $('#edit-theme-name').val();

                    // Make sure the field isn't empty
                    if (!/\S/.test(name) || name == 'undefined') {

                        $('#edit-theme-name-modal .info-error').empty().html('Le nom ne peut pas être vide.');

                    } else {

                        // Delete error message
                        $('#edit-theme-name-modal .info-error').empty();

                        // Send the data to the database
                        $.ajax({
                            url: './admin_api.php',
                            method: 'POST',
                            async: true,
                            data: {
                                mode: 'edit_theme_name',
                                name: name,
                                id: id
                            },
                            dataType: 'json',
                            beforeSend: function() {
                                // Do sth
                            },
                            success: function(response) {

                                // Check if an error happened or not
                                if (response.success == true) {
                    
                                    // Empty error messages
                                    $('#edit-theme-name-modal .info-error').empty();

                                    // Update the collection's title on the interface
                                    $('#theme-' + id + ' p').empty().append(name);

                                    // Update the <select> field for giving layers a theme
                                    fillLayersThemesSelect();

                                    // Update the themes order
                                    $('.themes-list').trigger('sortupdate');

                                    // Close the dialog
                                    $('#edit-theme-name-modal').dialog("close");
                                                    
                                } else {
                                    // Display the error
                                    console.error(response.error);
                                    $('#edit-theme-name-modal .info-error').empty().html(response.error);
                                }
                    
                            },
                            complete: function() {
                                // Do sth
                            },
                            error: function(response) {
                                console.error(response.error);
                                $('#edit-theme-name-modal .info-error').empty().html(response.error);
                            }
                        });
                    }
                },
                Cancel: function () {
                    $(this).dialog("close");
                }
            },
            close: function () {

                // Update the <select> field for giving layers a theme
                fillLayersThemesSelect();

                // Reload the layers list
                fetchLayersFromDB();

            }
        });
    };

    // Trigger the collection's rename from menu
    $(document).on('click', '.menu-rename-theme', function () {

        // Fetch needed variables
        var target = $('.theme-parameters.active').parents('li');
        var id = target.attr('id').replace('theme-', '');
        var currentname = target.find('p').html();

        // Rename the collection
        renameTheme(id, currentname);
    });

    // Add a new collection
    function addTheme() {

        // Send the query to the api
        $.ajax({
            url: './admin_api.php',
            method: 'POST',
            async: true,
            data: {mode: 'add_theme'},
            dataType: 'json',
            beforeSend: function() {
                // Do sth
            },
            success: function(response) {
                // Check if an error happened or not
                if (response.success == true || response.error_code == 2) {
    
                    // Empty error messages
                    $('#themes-error-message').empty();
    
                    // Add the new collection to the list
                    var html = writeThemeBlock(response.id, '[new theme]');
        
                    // Append the content to the interface
                    $(html).insertBefore('#theme-1');

                    // Update the themes order
                    $('.themes-list').trigger('sortupdate');

                    // Open the "rename" menu for the element with id = reponse.id
                    renameTheme(response.id, '[new theme]');

                } else {
                    // Display the error
                    console.error(response.error);
                    $('#themes-error-message').empty().append(response.error);
                }
    
            },
            complete: function() {
                // Do sth
            },
            error: function(response) {
                console.error(response.error);
                $('#themes-error-message').empty().append(response.error);
            }
        });

    }; // End of the function to add a new collection

    // Trigger the "add collection" with a click event
    $('#add-theme').click(function() {

        addTheme();

        // Update the element's position in the database
        $('.themes-list').trigger('sortupdate');

    });


    
// End of document.ready() function
});