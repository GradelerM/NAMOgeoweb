var execOnLoad;

// Note: this script needs storymaps_template.js to be called too in the .php page in order to work properly
// If you have some "function() is not defined" errors, please make sure storymaps_template.js exists and is called

// Variables to be accessed from outside this script (global variables)
var overviewMap;
var allStoryLayers;

execOnLoad = function() { // Wrap everything in it so the applications loads only when the layers have been fetched from the database

    jQuery(document).ready(function() {

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
        =================================================================================
        Load all of the available basemaps in the main application (map.js)
        =================================================================================
        */
        function loadBasemaps() {
            var list = $('#select-basemap');
            for (i = 0; i < basemaps.length; i++) {
                $('#select-basemap').append(new Option(basemaps[i], basemaps[i]));
            }
        }
        loadBasemaps();

        /* 
        =================================================================================
        Load the book collections from the database as soon as the application is ready
        =================================================================================
        */
        $.ajax({
            url: './api.php',
            method: 'POST',
            async: true,
            data: {mode:'collections'},
            dataType: 'json',
            success: function(response) {
                // Check if success = true or false
                if (response.success === true) {
                    for (i = 0; i < response.collections.length; i++) {
                        $('#book-collection').append(new Option(response.collections[i].name, response.collections[i].id));
                    }
                } else {
                    console.error(response.error);
                }
            },
            error: function(response) {
                console.error(response.error);
            }
        });

        /* 
        =================================================================================
        Load the user's books as soon as the application is ready
        =================================================================================
        */
        function loadUserBooksList() {
           
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode:'fetch_users_books'},
                dataType: 'json',
                // Before sending the call, show a loader on the app
                beforeSend: function() {
                    $('#user-books-list-container .loader-container').show();
                },
                success: function(response) {
                    // Check if success = true or false
                    if (response.success === true) {

                        // Before anything else, check if we have to load pending and published books too
                        if (response.load_extra_books == true) {
                            loadPendingBooksList(); // Load the pendings books the user can edit
                            loadPublishedBooksList(); // Load the published books the user can edit
                        }
                        
                        // Empty the books table (just in case)
                        $('#user-books-list').empty();

                        if (response.books_list.length == 0) {
                            $('#create-load-book p:first-child').html('Vous n\'avez encore créé aucune carte narrative.');
                        } else {

                            // Displaying a table header
                            var table_header =  '<tr><th>Titre</th><th>Statut</th><th></th></tr>';
                            $('#user-books-list').append(table_header);

                            // Displaying the table's content
                            for (i = 0; i < response.books_list.length; i++) {

                                // Translate the book's status in french
                                if (response.books_list[i].status == 'draft') {
                                    status = 'Brouillon';
                                } else if (response.books_list[i].status == 'pending') {
                                    status = 'En attente de publication';
                                } else if (response.books_list[i].status == 'published') {
                                    status = 'Publiée';
                                }

                                // Write "sans titre" when the map's title is null or empty
                                var title ="";
                                if (!/\S/.test(response.books_list[i].title) || typeof response.books_list[i].title == 'undefined' || response.books_list[i].title == null) {
                                    title = "<i>[Sans titre]</i>";
                                } else {
                                    title = response.books_list[i].title;
                                }

                                // Write the html code to append
                                var table_content = '<tr class="book-' + response.books_list[i].status + '">' +
                                                    '<td>' + title + '</td>' +
                                                    '<td>' + status + '</td>' +
                                                    '<td class="centered"><button id="' + response.books_list[i].id + '" class="edit">Éditer</button></td>' +
                                                    '<td class="centered"><button id="delete-' + response.books_list[i].id + '" class="delete">Supprimer</button></td>' +
                                                    '</tr>';
                                $('#user-books-list').append(table_content);
                            }  
                        }

                    } else {
                        // No need to display this error, it is already displayed by another function
                        // console.error(response.error);
                    }

                },
                // Remove the loader once the query is completed
                complete: function() {
                    $('#user-books-list-container .loader-container').hide();
                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        }
        loadUserBooksList();


        /* 
        =================================================================================
        Load the pending books as soon as the application is ready
        =================================================================================
        */
        function loadPendingBooksList() {
            
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode:'fetch_pending_books'},
                dataType: 'json',
                // Before sending the call, show a loader on the app
                beforeSend: function() {
                    $('#pending-books-list-container .loader-container').show();
                },
                success: function(response) {
                    // Check if success = true or false
                    if (response.success === true) {
                        
                        // Empty the books table (just in case)
                        $('#pending-books-list').empty();

                        if (response.books_list == false) { // No books available
                            $('#pending-books-list-container').append('Il n\'y a aucune carte narrative en attente de publication.');
                        } else {

                            // Displaying a table header
                            var table_header =  '<tr><th>Titre</th><th>Auteur</th><th></th></tr>';
                            $('#pending-books-list').append(table_header);

                            // Displaying the table's content
                            for (i = 0; i < response.books_list.length; i++) {

                                // Write "sans titre" when the map's title is null or empty
                                var title ="";
                                if (!/\S/.test(response.books_list[i].title) || typeof response.books_list[i].title == 'undefined' || response.books_list[i].title == null) {
                                    title = "<i>[Sans titre]</i>";
                                } else {
                                    title = response.books_list[i].title;
                                }

                                // Write the html code to append
                                var table_content = '<tr class="book-pending">' +
                                                    '<td>' + title + '</td>' +
                                                    '<td>' + response.books_list[i].author + '</td>' +
                                                    '<td class="centered"><button id="' + response.books_list[i].id + '" class="edit">Éditer</button></td>' +
                                                    '</tr>';
                                $('#pending-books-list').append(table_content);
                            }  
                        }

                    } else {
                        // No need to display this error, it is already displayed by another function
                        // console.error(response.error);
                    }

                },
                // Remove the loader once the query is completed
                complete: function() {
                    $('#pending-books-list-container .loader-container').hide();
                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        }

        /* 
        =================================================================================
        Load the published books as soon as the application is ready
        =================================================================================
        */
        function loadPublishedBooksList() {
            
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode:'fetch_published_books'},
                dataType: 'json',
                // Before sending the call, show a loader on the app
                beforeSend: function() {
                    $('#published-books-list-container .loader-container').show();
                },
                success: function(response) {
                    // Check if success = true or false
                    if (response.success === true) {
                        
                        // Empty the books table (just in case)
                        $('#published-books-list').empty();

                        if (response.books_list == false) { // No books available
                            $('#published-books-list-container').append('Il n\'y a aucune carte narrative publiée.');
                        } else {

                            // Displaying a table header
                            var table_header =  '<tr><th>Titre</th><th>Auteur</th><th></th></tr>';
                            $('#published-books-list').append(table_header);

                            // Displaying the table's content
                            for (i = 0; i < response.books_list.length; i++) {

                                // Write "sans titre" when the map's title is null or empty
                                var title ="";
                                if (!/\S/.test(response.books_list[i].title) || typeof response.books_list[i].title == 'undefined' || response.books_list[i].title == null) {
                                    title = "<i>[Sans titre]</i>";
                                } else {
                                    title = response.books_list[i].title;
                                }

                                // Write the html code to append
                                var table_content = '<tr class="book-published">' +
                                                    '<td>' + title + '</td>' +
                                                    '<td>' + response.books_list[i].author + '</td>' +
                                                    '<td class="centered"><button id="' + response.books_list[i].id + '" class="edit">Éditer</button></td>' +
                                                    '</tr>';
                                $('#published-books-list').append(table_content);
                            }  
                        }

                    } else {
                        // No need to display this error, it is already displayed by another function
                        // console.error(response.error);
                    }

                },
                // Remove the loader once the query is completed
                complete: function() {
                    $('#published-books-list-container .loader-container').hide();
                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        }

        /* 
        =================================================================
        Display the user's books when the app is ready
        =================================================================
        */
        $('#create-load-book').removeClass('hidden');
        // Memo : don't forget to add a loader so the user knows he has to wait

        /* 
        =================================================================================
        Function to delete an existing book
        =================================================================================
        */
        function deleteBook(book_to_delete) {
            // Make sure there is indeed a book to delete
            if (book_to_delete !== undefined) {
                
                $.ajax({
                    url: './api.php',
                    method: 'POST',
                    async: true,
                    data: {
                            mode:'delete_book',
                            book_id: book_to_delete            
                        },
                    dataType: 'json',
                    success: function(response) {
                        // Reload the books list
                        loadUserBooksList();
                    },
                    error: function(response) {
                        console.error(response.error);
                    }
                });

            } else {
                console.error('Book id undefined');
            }
        }

        /* 
        =================================================================================
        The user chooses to delete a book
        =================================================================================
        */
        var book_to_delete = undefined;
        $(document).on('click', '#user-books-list button.delete', function () {
            var self = $(this);
            book_to_delete = self.attr('id').replace('delete-', '');

            // Then display a warning
            $('#confirm-book-deletion').removeClass('hidden');
        });

        // If the user clicks 'no' then hide the warning and do nothing else
        $('#book-deletion-no').on('click', function () {
            $('#confirm-book-deletion').addClass('hidden');
            // Reset book_to_delete value
            book_to_delete = undefined;
        });

        // It the user clicks yes, then delete the book
        $('#book-deletion-yes').on('click', function () {
            $('#confirm-book-deletion').addClass('hidden');
            // Delete the book
            deleteBook(book_to_delete);
        });

        /* 
        =================================================================
        Function to load an existing book
        =================================================================
        */
        function loadBook(book_id) {
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                        mode:'load_book',
                        book_id: book_id            
                    },
                dataType: 'json',
                success: function(response) {
                    // Display the book's title
                    if (!/\S/.test(response.book_title) || typeof response.book_title == 'undefined') {
                        response.book_title = "";
                    }
                    $('#field-book-title').val(escapeHtmlRevert(response.book_title));

                    // Display the book's collection
                    $('#book-collection').val(response.book_collection);

                    // Display the book's abstract
                    if (!/\S/.test(response.book_abstract) || typeof response.book_abstract == 'undefined') {
                        response.book_abstract = "";
                    }
                    $('#field-book-abstract').val(escapeHtmlRevert(response.book_abstract));

                    // Display the book's legal notice
                    if (!/\S/.test(response.book_legal_notice) || typeof response.book_legal_notice == 'undefined') {
                        response.book_legal_notice = "";
                    }
                    $('#field-book-legal-notice').val(escapeHtmlRevert(response.book_legal_notice));

                    // Display the book's current status //TEMP
                    $('#publish-switch input[type="checkbox"]').attr('checked', false);

                    // Now display the book's current status
                    $('#storymap-status').val(response.status);

                    // And if the user isn't the book's owner, prevent him from using the "draft" option
                    if (response.owner == false) {
                        $('#storymap-status option[value=draft]').remove();
                    }

                    /*
                    if (response.status == 'published') {
                        $('#publish-switch input[type="checkbox"]').attr('checked', true);
                    } else {
                        $('#publish-switch input[type="checkbox"]').attr('checked', false);
                    }
                    */

                    // Load and display the book's chapters
                    if (response.chapters.length > 0) { // Display chapters only when the book has some
                        loadChapters(response.chapters);
                    }

                    // Hide the modal
                    $('#create-load-book').addClass('hidden');
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        }

        /* 
        =================================================================
        Function to create a new book
        =================================================================
        */
        function createBook() {
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode:'create_book'},
                dataType: 'json',
                success: function(response) {
                    loadBook(response.book_id);
                    $('#create-load-book').addClass('hidden');
                },
                error: function(response) {
                    console.error('Error while creating a book. ' + response.error);
                }
            });
        }

        /* 
        =================================================================
        The user chooses to edit an existing book
        =================================================================
        */
        function editBook(book_id, message) {
            $('#edit-book-modal').dialog({
                book_id: book_id, // Adding the book's id when the function is called
                resizable: false,
                width: 400,
                modal: true,
                buttons: {
                    "Editer": function () {
                        $(this).dialog("close");
                        loadBook(book_id);
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

        // From his own book collection
        $(document).on('click', '#user-books-list button.edit', function () {
            var self = $(this);
            var book_id = self.attr('id');
            var map_status = self.parents('tr');

            // If the user wants to edit a published book :
            if ($(map_status).hasClass('book-published') == true) {

                // Generate an informative message
                var message = "Cette carte narrative est déjà publiée sur l'application.<br>" +
                            "Si vous décidez de l'éditer, elle ne sera plus accessible jusqu'à la prochaine validation par un administrateur.<br>" +
                            "Êtes-vous sûr(e) de vouloir éditer cette carte narrative ? Cette action est irréversible.";
                
                // Display the modal
                editBook(book_id, message);

                // Make sure we exit this function
                return;

            } else if ($(map_status).hasClass('book-pending') == true) { // If the user wants to edit a pending book

                // Generate an informative message
                var message = "Cette carte narrative est en attente de publication par un administrateur.<br>" +
                            "Elle est accessible aux administrateurs et aux éditeurs pour vérification du contenu.<br>" +
                            "Si votre carte n'est pas encore prête à être soumise à évaluation, nous vous conseillons de la classer en tant que brouillon (onglet 'publier').";
                
                // Display the modal
                editBook(book_id, message);

                // Make sure we exit this function
                return;

            } else if ($(map_status).hasClass('book-draft') == true) { // If the user wants to edit a draft book

                // Then, just load the book without further confirmation
                loadBook(book_id);

                // And make sure we exit this function
                return;
            }
        });

        // He chooses to edit a pending book
        $(document).on('click', '#pending-books-list button.edit', function () {
            var self = $(this);
            var book_id = self.attr('id');

            // Generate an informative message
            var message = "Cette carte narrative est en attente de publication par un administrateur.<br>" +
                        "Souhaitez vous charger cette carte narrative ? Vous aurez la possibilité de la prévisualiser, de l'éditer si besoin et de la publier.";
            
            // Display the modal
            editBook(book_id, message);

            // Make sure we exit this function
            return;

        });

        // He chooses to edit a published book
        $(document).on('click', '#published-books-list button.edit', function () {
            var self = $(this);
            var book_id = self.attr('id');

            // Generate an informative message
            var message = "Cette carte narrative est publiée sur l'application.<br>" +
                        "Toute modification de la carte annulera sa publication sur l'application et l'ajoutera à la liste des cartes en attente de publication.<br>" +
                        "De plus, l'auteur de la carte recevra une notification lui indiquant que sa carte a été dépubliée." +
                        "Souhaitez-vous charger cette carte narrative ?";
            
            // Display the modal
            editBook(book_id, message);

            // Make sure we exit this function
            return;

        });

        /* 
        =================================================================
        Main loader interactions
        =================================================================
        */
        // Hide the loaders
        $('#main-loader-paragraph').hide();
        $('#main-loader-map').hide();

        /* 
        =================================================================
        The user chooses to write a new book
        =================================================================
        */
        $(document).on('click', '#new-book', function() {
            // Create a new book
            createBook();
        });

        
        /* 
        =================================================================
        Displaying numbers : round off to "precision" decimals
        =================================================================
        */
        function roundOff(num, precision) {
            if (precision == null) {
                precision = 2;
            }
            var pow = Math.pow(10, precision);
            return Math.round(num * pow) / pow;
        };
        
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
        Main modal controls
        =================================================================
        */
        $(document).on('click', '#main-modal-ok', function(){
            $('#main-modal').addClass('hidden');
        });

        /*
        =================================================================
        Display tooltips
        =================================================================
        */
        // "Save" option tooltip
        $(document).on('mouseenter', '.paragraph-editor-save', function() {
            var position = $(this).position();
            var top = position.top - 34;
            var left = position.left - 54;
            $('#paragraph-editor-save-tooltip').css({top: top, left: left})
            .removeClass('hidden');
        });
        $(document).on('mouseleave', '.paragraph-editor-save', function() {
            $('#paragraph-editor-save-tooltip').addClass('hidden');
        });

        // "Cancel" option tooltip
        $(document).on('mouseenter', '.paragraph-editor-cancel', function() {
            var position = $(this).position();
            var top = position.top - 34;
            var left = position.left - 54;
            $('#paragraph-editor-cancel-tooltip').css({top: top, left: left})
            .removeClass('hidden');
        });
        $(document).on('mouseleave', '.paragraph-editor-cancel', function() {
            $('#paragraph-editor-cancel-tooltip').addClass('hidden');
        });

        // Info : internal-image-info
        $(document).on('mouseenter', '.internal-image-info', function() {
            var position = $(this).position();
            var top = position.top - 10;
            var left = position.left + 24;
            $('#internal-image-info-tooltip').css({top: top, left: left})
            .removeClass('hidden');
        });
        $(document).on('mouseleave', '.internal-image-info', function() {
            $('#internal-image-info-tooltip').addClass('hidden');
        });

        //Info : image-legend-info
        $(document).on('mouseenter', '.image-legend-info', function() {
            var position = $(this).position();
            var top = position.top - 10;
            var left = position.left + 24;
            $('#image-legend-info-tooltip').css({top: top, left: left})
            .removeClass('hidden');
        });
        $(document).on('mouseleave', '.image-legend-info', function() {
            $('#image-legend-info-tooltip').addClass('hidden');
        });

        //Info : layer-selection-info
        $(document).on('mouseenter', '.layer-selection-info', function() {
            var position = $(this).position();
            var top = position.top - 10;
            var left = position.left + 24;
            $('#layer-selection-info-tooltip').css({top: top, left: left})
            .removeClass('hidden');
        });
        $(document).on('mouseleave', '.layer-selection-info', function() {
            $('#layer-selection-info-tooltip').addClass('hidden');
        });

        /*
        =================================================================
        JQuery-UI sortable lists
        =================================================================
        */
        // Chapters list
        $(function() {
            $('.table-of-contents-list').sortable({
                axis: "y",
                items: 'li:not(.ui-state-disabled)',
                placeholder: 'ui-state-highlight',
            });
            $('.table-of-contents-list').disableSelection();
        });

        // Update chapters order with sortable
        $('.table-of-contents-list').on('sortupdate', function (event, ui) {
            // Init empty array
            var chapters_array = [];

            $(this).children().each(function (index) {
                // Get the chapter's id
                var chapter_id = $(this).attr('id').replace('chapter-', '');
                // Get the chapter's position
                var chapter_index = index;

                // Make sure we only store the chapters and not the introduction and "+" button (top and bottom of the list)
                if (chapter_id !== 'story-intro' && chapter_id !== 'add-chapter') {
                    // Store it in an object
                    var chapter = {
                        id: chapter_id,
                        index: chapter_index
                    };
                    // Push this object in an array to send to the database
                    chapters_array.push(chapter);
                }
            });

            // Send this table to the database so we can update the chapter's position
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode:'update_chapter_position',
                    array: chapters_array
                },
                dataType: 'json',
                success: function() {
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        });

        // paragraphs in a chapter
        $(function() {
            $('.paragraph-list').sortable({
                axis: "y",
                items: '> li:not(.ui-state-disabled)',
                placeholder: 'ui-state-highlight',
            });
            $('.paragraph-list').disableSelection();
        });

        // Update paragraphs order with sortable
        $('.paragraph-list').on('sortupdate', function (event, ui) {

            // Init paragraph empty array
            var paragraphs_array = [];

            // Get the chapter's id
            var chapter_id = getActiveChapter();

            // Get the needed informations for each paragraph of the list
            $(this).children().each(function (index) {
                // Get the paragraphs's id
                var paragraph_id = $(this).attr('id').replace('paragraph-', '');
                // Get the paragraph's position
                var paragraph_index = index;

                // Make sure we only store the paragraphs and not the "add new paragraph" section
                if (paragraph_id !== 'add-paragraph') {
                    // Store the informations in an object
                    var paragraph = {
                        id: paragraph_id,
                        index: paragraph_index
                    };
                    // Push this object in an array to send to the database
                    paragraphs_array.push(paragraph);
                }
            });

            // Send the data to the server
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode:'update_paragraph_position',
                    chapter_id: chapter_id,
                    array: paragraphs_array
                },
                dataType: 'json',
                success: function() {
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        });

        /*
        =================================================================
        Chapter parameters menu
        =================================================================
        */
        // Display chapter parameters menu on click on parameters icon
        $(document).on('click', '.chapter-parameters', function() {
            if ($(this).closest('li').hasClass('active') == true && $('.chapter-parameters-menu').css('display') !== 'none') {
                $('.chapter-parameters-menu').hide();
            } else {
                var chapterId = ($(this).closest('li').attr('id'));
                var position = $(this).position();
                var left = position.left + 30;
                var top = position.top ;
                $('.chapter-parameters-menu').css({'left': left, 'top': top}).show();
                $('.chapter-parameters-menu').attr('id', chapterId+'-menu');
            }
        });

        // Delete chapter : display warning message
        var chapterToDelete = undefined;
        $(document).on('click', '.menu-supprimer-chapter', function() {
            chapterToDelete = ($(this).closest('.chapter-parameters-menu').attr('id')).replace('-menu', '');
            $('#confirm-chapter-deletion').removeClass('hidden');
        });

        // If the user confirms chapter deletion
        $('#chapter-deletion-yes').click(function() {
            if (chapterToDelete !== undefined) {
                if ($('#'+chapterToDelete).hasClass('active') == true) {

                    // Getting the id from the chapter to delete
                    var chapter_id = chapterToDelete.replace('chapter-', '');

                    // Sending the informations to the api
                    $.ajax({
                        url: './api.php',
                        method: 'POST',
                        async: true,
                        data: {
                            mode:'delete_chapter',
                            chapter_id: chapter_id
                        },
                        dataType: 'json',
                        success: function(response) {
                                // Removing chapter from interface
                                $('#chapter-edition').addClass('hidden');
                                $('#map-edition').addClass('hidden');
                                $('#chapter-'+chapter_id).remove();
                                // Update chapters positions
                                $('.table-of-contents-list').trigger('sortupdate');
                        },
                        error: function(response) {
                            console.error(response.error);
                        }
                    });
                };
                chapterToDelete = undefined;                
                }
            $('#confirm-chapter-deletion').addClass('hidden');
        });

        // If the user changes their mind
        $('#chapter-deletion-no').click(function() {
            chapterToDelete = undefined;
            $('#confirm-chapter-deletion').addClass('hidden');
        });

        // If the user clicks elsewhere
        $('#confirm-chapter-deletion').click(function() {
            chapterToDelete = undefined;
            $('#confirm-chapter-deletion').addClass('hidden');
        });

        /*
        =================================================================
        Chapter contents
        =================================================================
        */
        // Display paragraph parameters menu on click on parameters icon
        $(document).on('click', '.paragraph-parameters', function() {
            if ($(this).closest('li').hasClass('active') == true && $('.paragraph-parameters-menu').css('display') !== 'none') {
                $('.paragraph-parameters-menu').hide();
            } else {
                var chapterId = ($(this).closest('li').attr('id'));
                var position = $(this).position();
                var left = position.left + 30;
                var top = position.top ;
                $('.paragraph-parameters-menu').css({'left': left, 'top': top}).show();
                $('.paragraph-parameters-menu').attr('id', chapterId+'-menu');
            }
        });

        /* Deleting a paragraph */
        function deleteParagraph(chapter_id, paragraph_id) {

            // Send the informations to the server
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode:'delete_paragraph',
                    paragraph_id: paragraph_id,
                    chapter_id: chapter_id
                },
                dataType: 'json',
                success: function() {
                    // Remove the deleted paragraph from the interface
                    var target = "#paragraph-" + paragraph_id;
                    $(target).remove();
                    // Update paragraphs positions
                    $('.paragraph-list').trigger('sortupdate');
                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        }

        // Reset paragraphToDelete variable (stores the paragraph's div id, for instance : "paragraph-1")
        var paragraphToDelete = undefined; 

        // Display warning message on click on "supprimer" in the paragraph's contextual menu
        $(document).on('click', '.menu-supprimer-paragraph', function() {
            paragraphToDelete = ($(this).closest('.paragraph-parameters-menu').attr('id')).replace('-menu', '');
            $('#confirm-paragraph-deletion').removeClass('hidden');
        });

        // The user confirms the paragraph's deletion
        $('#paragraph-deletion-yes').click(function() {
            if (paragraphToDelete !== undefined) {
                // Get chapter and paragraph indexes
                var chapter_id = getActiveChapter();
                var paragraph_id = paragraphToDelete.replace('paragraph-', '');

                deleteParagraph(chapter_id, paragraph_id);

                }
            $('#confirm-paragraph-deletion').addClass('hidden');
        });

        // The user cancels the deletion by clicking on "no"
        $('#paragraph-deletion-no').click(function() {
            paragraphToDelete = undefined;
            $('#confirm-paragraph-deletion').addClass('hidden');
        });

        // The user cancels the deletion by clicking anywhere else on the window
        $('#confirm-paragraph-deletion').click(function() {
            paragraphToDelete = undefined;
            $('#confirm-paragraph-deletion').addClass('hidden');
        });

        /*
        =================================================================
        Modals, menus, etc. global parameters
        =================================================================
        */

        /*
        Hide contextual menus on scroll
        */

        // Scrolling on main content
        $('.content').scroll(function() {
            $('.chapter-parameters-menu').hide();
            $('.paragraph-parameters-menu').hide();
        });
        
        // Scrolling on table-of-contents-list
        $('#table-of-contents-list').scroll(function() {
            $('.chapter-parameters-menu').hide();
            $('.paragraph-parameters-menu').hide();
        });

        // Scrolling on chapter-list
        $('#chapter-list').scroll(function() {
            $('.chapter-parameters-menu').hide();
            $('.paragraph-parameters-menu').hide();
        });

        /*
        Close menus, modals, etc. when clicked outside
        */
        $(document).on('click', function(e) {
            // Exit #chapter-parameters-menu
            if ($(e.target).closest('a').hasClass('chapter-parameters') == false) {
                $('.chapter-parameters-menu').hide();
            };
            // Exit #paragraph-parameters-menu
            if ($(e.target).closest('a').hasClass('paragraph-parameters') == false) {
                $('.paragraph-parameters-menu').hide();
            };
        });

        /*
        Slideup and slidedown paragraphs
        */
        $(document).on('click', '.paragraph-shrink-button', function() {
            var bodyToToggle = $(this).parents('li').children('.paragraph-body').slideUp();
            if (bodyToToggle.hasClass('.hidden') == false) {
                bodyToToggle.slideUp();
                bodyToToggle.addClass('.hidden');
                $(this).html('Agrandir');
            } else {
                bodyToToggle.slideDown();
                bodyToToggle.removeClass('.hidden');
                $(this).html('Réduire');
            }
        });

        /*
        =================================================================
        Make sure the links inserted by the users open in a new tab
        =================================================================
        */
        // For markdown text in "Editeur"
        $(document).on('click', '.markdown-render a', function() {
            window.open($(this).attr('href'));
            return false;
        });
        
        // For content in story-tab in the story overview "Aperçu"
        $(document).on('click', '.story-container a', function() {
            window.open($(this).attr('href'));
            return false;
        });

        /*
        =================================================================
        Href preview for links // TODO
        =================================================================
        */
        // For markdown text in "Editeur"
        $(document).on('mouseenter', '.markdown-render a', function() {
            var href = $(this).attr('href');
            var position = $(this).position();
            var top = position.top - 28;
            var left = position.left;
            $('#href-preview-tooltip').css({top: top, left: left})
                                    .html(href)
                                    .removeClass('hidden');
            return false;
        });
        $(document).on('mouseleave', '.markdown-render a', function() {
            $('#href-preview-tooltip').addClass('hidden');
        });

        /*
        =================================================================
        Saving "informations" panel content
        =================================================================
        */
        /* Forcing focusout on certain fields when "enter" is pressed */
        $(document).on('keypress', '#field-book-title, #field-book-legal-notice', function(e) {
            var key = e.which;
            if (key == 13) // 13 corresponds to "enter" code 
            {
                $(this).blur();
            }
        });

        // Function to send the new book's title in the database
        function saveBookInfo(mode, field) {
            // Trim and escape the text
            var content = trim($(field).val());
            var content = escapeHtml(content);
            // Send the new title to the database
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode: mode, content: content},
                dataType: 'json',
                success: function() {
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        }

        // Save the book's title on focusout
        $('#field-book-title').on('focusout', function () {
            var mode = 'save_title';
            var field = this;
            saveBookInfo(mode, field);
        });

        // Save the book's abstract on focusout
        $('#field-book-abstract').on('focusout', function () {
            var mode = 'save_abstract';
            var field = this;
            saveBookInfo(mode, field);
        });

        // Save the book's legal notice on focusout
        $('#field-book-legal-notice').on('focusout', function () {
            var mode = 'save_legal_notice';
            var field = this;
            saveBookInfo(mode, field);
        });

        // Save the book's title on focusout
        $('#book-collection').on('change', function () {
            var collection_id = $(this).val();
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode: 'save_collection', collection_id: collection_id},
                dataType: 'json',
                success: function() {
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        });

        /*
        =================================================================
        Map caption
        =================================================================
        */
        // Map caption
        var mapCaption = new ol.Map({
            target: 'map-caption',
            controls: [

            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([-61.4204, 16.1876]),
                zoom: 8
            })
        });


            
        /*
        =================================================================
        Html templates
        =================================================================
        */
        // Chapter html template
        function chapterTemplate(title) {
            if (title == '' || title == 'undefined' || title == null) {
                title = '[Sans titre]';
            }

            // Decode encoded characters
            var title = escapeHtmlRevert(title);

            var result = '<li id="" class="selectable ui-state-default ui-sortable-handle">' +
                        '<p>' + title + '</p>' +
                        '<a href="#" class="chapter-parameters"><svg><use xlink:href="#iconeParameters" /></use></svg></a>' +
                        '</li>';
            return result;
        };

        // Chapter javascript object template
        var emptyChapter = {
            title: '',
            paragraphs: [
                {
                    type: 'textMarkdown',
                    content: '',
                    url: ''
                }
            ],
            map: {
                center: {x: -61.4, y: 16},
                zoom: 8,
                basemap: {id: 'planOSM', title: 'planOSM'},
                layers: {}
            }
        };

        // Generating an empty paragraph in the chapter
        function addEmptyParagraph(chapter_id, type) {

            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode: 'add_new_paragraph',
                    chapter_id: chapter_id,
                    type: type
                },
                dataType: 'json',
                success: function(response) {

                    console.log('Response from api:');
                    console.log(response);

                    // Display the new paragraph in the interface
                    paragraph = readParagraph(response.paragraph);
                    addParagraph(paragraph);

                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        };

        /*
        =================================================================
        Adding and loading chapters
        =================================================================
        */  
        // Function to add a chapter in "déroulé de ma carte narrative" section
        function addChapter(chapter) {
            var chapterHtml = chapterTemplate(chapter.title);
            $(chapterHtml).insertBefore('#add-chapter')
                            .attr('id', 'chapter-' + chapter.id);
        };

        // Load the chapters of a book in the app
        function loadChapters(chapters) {
            // Empty the "déroulé de ma carte narrative" part and reload chapters
            var elmt = $('#table-of-contents-list .ui-state-default:not(.ui-state-disabled)');
            if (elmt.length > 0) {
                elmt.each(function (i, elmt) {
                    elmt.remove();
                })
            }

            // Add each chapter in the interface
            chapters.forEach(function (chapter, index) {
                addChapter(chapter, index);
            })
        };

        // Add a new chapter to the story
        $('#add-chapter').on('click', function () {

            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode: 'add_chapter'},
                dataType: 'json',
                success: function(response) {
                    addChapter(response.chapter);
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        });

        // Function to get the current active chapter
        function getActiveChapter() {
            var activeChapter = $('#table-of-contents-list > .active').attr('id').replace('chapter-', '');
            return activeChapter;
        };


        /*
        =================================================================
        Manipulate paragraphs
        =================================================================
        */  

        // Function to get the parent paragraph's id when applied to a child of this paragraph (ex: apply to textarea on click)
        function getParagraphIndex(e) {
            var getParagraphIndex = $(e).parents('.paragraph').attr('id');
            getParagraphIndex = getParagraphIndex.replace('paragraph-', '');
            return getParagraphIndex;
        };

        // The paragraphs templates are stored in storytool_interactions.js
        // Reason: they are needed in map.php too to display the published stories

        function newParagraphTopbar(type) {
            var paragraphInfo = getParagraphTemplate(type);
            var paragraphTopbar =   '<div class="paragraph-topbar">' +
                                    '<p>' + paragraphInfo.title + ' <i>- ' + paragraphInfo.info + '</i></p>' +
                                    '<div class="icons-group">' +
                                    // Option : allows to add one other element to the paragraph's topbar (see Markdown guide for instance)
                                    '<a href="#" class="' + paragraphInfo.option[1] + '">' + paragraphInfo.option[0] + '</a>' +
                                    '<a href="#" class="paragraph-shrink-button">Réduire</a>' +
                                    '<a href="#" class="paragraph-parameters"><svg><use xlink:href="#iconeParameters" /></use></svg></a>' +
                                    '</div>' +
                                    '</div>';
            return paragraphTopbar;
        };
        
        // Read and write a paragraph to be displayed in the application with "addParagraph"
        function readParagraph(paragraph) {
            var paragraphBody = getParagraphTemplate(paragraph.type);
            var result =    '<li id="paragraph-' + paragraph.id + '" class="paragraph ui-state-default">' +
                            newParagraphTopbar(paragraph.type) +
                            paragraphBody.template(paragraph.content, paragraph.url) +
                            '</li>' ;
            return result;
        }

        // Add a paragraph
        function addParagraph(completedParagraph) {
            $(completedParagraph).insertBefore('#add-paragraph');
        };

        // Read and add all the paragraphs from one chapter
        function readChapterParagraphs(chapterIndex) { 
            
            // Fetch all the chapter's paragraphs in an array
            // The array must contain id, type, content, url and position
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode: 'read_chapter_paragraphs',
                    chapter_id: chapterIndex
                },
                dataType: 'json',
                beforeSend: function() {
                    $('#main-loader-paragraph').show();
                    $('#main-loader-map').show();
                },
                success: function(response) {
                    
                    // Check if the chapter is empty or not
                    if (response.paragraphs !== 'empty') {
                        // For each one of the paragraphs :
                        response.paragraphs.forEach(function(e) {
                        // Write the paragraphs's html content
                        var paragraph = readParagraph(e);
                        // Add the paragraph the the website
                        addParagraph(paragraph);
                    });
                    }

                    // Hide the loaders
                    $('#main-loader-paragraph').hide();
                    $('#main-loader-map').hide();
                    
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        };

        // Add every available paragraph type on the "add-paragraph" select list
        function generateParagraphTypesList() {
            paragraphTemplate.forEach(function (e) {
                $('#add-paragraph > #new-paragraph-type').append(new Option(e.title + ' ' + e.info, e.type));
            })
        }
        generateParagraphTypesList();

        // Trigger new paragraph insertion on click
        $(document).on('click', '#new-paragraph-add', function () {
            var chapter_id = getActiveChapter();
            var type = $('#new-paragraph-type').val();
            addEmptyParagraph(chapter_id, type);
        });

        // Read the introduction content
        function readIntroduction() {

            // Fetch all the introduction's paragraphs
            // The array must contain id, type, content, url and position
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {mode: 'read_introduction_paragraphs'},
                dataType: 'json',
                beforeSend: function() {
                    $('#main-loader-paragraph').show();
                    $('#main-loader-map').show();
                },
                success: function(response) {
                    // Check if the introduction contains paragraphs
                    if (response.paragraphs !== 'empty' && response.paragraphs.length !== 0) {
                        // For each one of the paragraphs :
                        response.paragraphs.forEach(function(e) {
                            // Write the paragraphs's html content
                            var paragraph = readParagraph(e);
                            // Add the paragraph the the website
                            addParagraph(paragraph);
                        });
                    } else if (response.paragraphs.length == 0) { // If the introduction does not contain any paragraph yet
                        // Add new empty markdown paragraph
                        var chapter_id = getActiveChapter();
                        addEmptyParagraph(chapter_id, 'textMarkdown');
                    }

                    // Check if the element has been created every 500 ms
                    var interval = setInterval(function() {
                        var elmt = $('.paragraph-parameters');
                        if (elmt.length == 0) {
                            // Do nothing
                        } else { // The element exists, remove menu an kill setInterval
                            $('.paragraph-parameters').remove();
                            $('#main-loader-paragraph').hide();
                            $('#main-loader-map').hide();
                            clearInterval(interval);
                        }
                    }, 100);

                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        }

        // Display editing tools window
        function displayEditingWindow() {
            $('#chapter-edition').removeClass('hidden');
            $('#map-edition').removeClass('hidden');
        };

        // Empty editing tools paragraphs
        function emptyParagraphs() {
            var elmt = $('#paragraph-list > li.ui-state-default:not(#add-paragraph)');
            if (elmt.length > 0) {
                elmt.each(function (i, elmt) {
                    elmt.remove();
                })
            }
        };

        function readChapterTitle(chapterIndex) {
            // Fetch the chapter's title
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode: 'get_chapter_title',
                    chapter_id: chapterIndex
                },
                dataType: 'json',
                success: function(response) {
                    // Decode html
                    var title = escapeHtmlRevert(response.title);
                    $('#chapter-title').val(title);
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        };

        /*
        =================================================================
        Creating helper windows
        =================================================================
        */
        // Generate the helper windows
        $('.helper-window').draggable({
            containment: 'parent'
        });

        // Display the Markdown helper
        $(document).on('click', '.markdown-guide-link', function() {
            $('#markdown-helper').removeClass('hidden');
        });

        // Hide the Markdown helper
        $('.close-helper').click(function() {
            var helper = $(this).parents('.helper-window');
            helper.addClass('hidden');
        });

        /*
        =================================================================
        Importing local pictures
        =================================================================
        */    
        $(document).on('change', 'input[type="file"].local-picture-input', function() {

            // Prepare the informations to send
            var file = this.files[0];
            var chapter_id = getActiveChapter();
            var paragraph = $(this).parents('.paragraph');
            var paragraph_id = paragraph.attr('id').replace('paragraph-', '');

            // Create the form
            var form = new FormData();

            // Append content to the form
            form.append('file', file);
            form.append('mode', 'upload_image');
            form.append('chapter_id', chapter_id);
            form.append('paragraph_id', paragraph_id);

            // Send it to the server
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: form,
                contentType: false,
                cache: false,
                processData: false,
                beforeSend: function(){
                    // Insert here action to perform before sending the data to the server
                },
                success: function(response) {
                    // Actions to perform if the query is a success
                    var response = JSON.parse(response);
                    // Update the caption
                    var caption = $(paragraph).find('.picture-caption').find('img');
                    $(caption).attr('src', response.src);

                    // Locate the error message
                    var error_message = $(paragraph).find('.picture-error');

                    // Check if there is an error message to display even if the query was sent to the server
                    if (response.success == false) {
                        console.error(response.error_upload);
                        $(error_message).html(response.error_upload);
                    } else { // If the image was uploaded, hide the error message
                        $(error_message).html('');
                    }

                },
                error: function(response) {
                    // Displaying an error on query failure
                    console.error(response.error);
                }
            });

        });

        /*
        =================================================================
        Manipulate map view
        =================================================================
        */  

        function displayMapCenterValue(centerX, centerY) {
            $('#map-edition #input-x').val(centerX);
            $('#map-edition #input-y').val(centerY);
        };

        function displayMapZoomValue(zoom) {
            var roundZoom = roundOff(zoom, 1);
            $('#map-edition #input-zoom').val(roundZoom);
        };

        // Function to make sure we have 1 decimal displayed for the zoom value
        $('#map-edition #input-zoom').on('change focusout', function () {
            var val = $(this).val();
            val = roundOff(val, 1);
            $(this).val(val);
        });

        // Read, correct and display the basemap value
        function selectBasemap(basemap) {
            // Check if the value matches one of the available basemaps
            var exists = false;
            var response;

            for (let i = 0; i < basemaps.length; i++) {
                if (basemaps[i] == basemap) {
                    exists = true;
                }
            }

            if (exists === true) { // The values match, update it
                response = basemap;
                $('#select-basemap').val(response);
            } else { // The values don't match, display an error message and replace the basemap with the project's default 
                response = basemaps[0];
                $('#select-basemap').val(response);
                saveMapCaption();
            }
            return response;
        }

        function readMapView(chapter_id) {
            // Fetch the chapter's map informations
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode: 'get_chapter_map',
                    chapter_id: chapter_id
                },
                dataType: 'json',
                success: function(response) {
                    // Display the values on the map controls
                    displayMapCenterValue(response.latitude, response.longitude);
                    displayMapZoomValue(response.zoom);

                    // Update map view
                    editMapCaptionView();

                    // Select the right basemap value
                    var basemap = selectBasemap(response.basemap);
                    editMapCaptionBasemap(basemap);

                    // Add the selected layers to the map
                    // Empty the "#couches-list" section
                    $('#couches-list > .select-layers').each(function(){
                        $(this).remove();
                    });

                    // Read all the layers
                    var responseLayers = response.layers.split(',');

                    // Make sure these are unique
                    var layersToDisplay = [];
                    for (let i = 0; i < responseLayers.length; i++) {
                        if (layersToDisplay.indexOf(responseLayers[i]) === -1) {
                            layersToDisplay.push(responseLayers[i]);
                        }            
                    }

                    // Display the layers and fetch the error messages
                    var errors = [];
                    for (let i = 0; i < layersToDisplay.length; i++) {
                        // Make sure we don't try to display an "empty string" layer
                        if (layersToDisplay[i]) {
                            var response = addLayersSelection(layersToDisplay[i]);
        
                            // Check if there are any errors
                            if (response) {
                                if (response[0] == 'error') {
                                    errors.push(response[1]);
                                }
                            }
                        }
                    }

                    // If at least one error was detected, display an error modal message
                    if (errors.length > 0) {
                        // Display a modal with the errors in it
                        var modal = 'Les couches suivantes ne sont plus disponibles dans l\'application et ne pourront plus être affichées : <ul>';
                        // Create a list containing all the layers stored in error
                        for (let j = 0; j < errors.length; j++) {
                            modal = modal + '<li>' + errors[j] + '</li>';                        
                        }
                        modal = modal + '</ul></br>Veuillez contacter un administrateur de la plateforme pour toute information complémentaire.';
                        $('#main-modal p').html(modal);
                        $('#main-modal').removeClass('hidden');
                    }

                    // And make sure to disable the layers that are already selected
                    uniqueLayersSelection();

                },
                error: function(response) {
                    console.error(response.error);
                }

            });
        };

        // Edit map controls when map is moved
        function editMapControls() {
            var center = mapCaption.getView().getCenter(); // Get the center values
            center = ol.proj.transform(center, 'EPSG:3857', 'EPSG:4326'); // Reproject from Web Mercator in WGS84
            // Round off every element
            for (let i = 0; i < center.length; i++) {
                center[i] = roundOff(parseFloat(center[i]));
            };

            var zoom = mapCaption.getView().getZoom(); // Get the zoom value
            zoom = roundOff(parseFloat(zoom, 1)); // Round off the zoom value

            displayMapCenterValue(center[0], center[1]);
            displayMapZoomValue(zoom);
        };

        // Edit map position when controls are edited
        function editMapCaptionView() {
            // Center and zoom level
            var centerX = $('#map-edition #input-x').val();
            var centerY = $('#map-edition #input-y').val();
            var zoom = $('#map-edition #input-zoom').val();
            mapCaption.getView().setCenter(ol.proj.fromLonLat([centerX, centerY]));
            mapCaption.getView().setZoom(zoom);
        }

        function editMapCaptionBasemap(basemap) {
            // If the basemap is not defined then pick up the value from the #select-basemap field
            if (typeof basemap == 'undefined') {
                var basemap = $('#select-basemap').val();
            }
            // Remove the former basemap layer(s) from the map
            for (let i = 0; i < basemaps.length; i++) {
                mapCaption.removeLayer(window[basemaps[i]]);            
            }
            // Add the currently selected basemap to the map
            mapCaption.addLayer(window[basemap]);
        }

        /* 
        =================================================================================
        Layers interactions
        =================================================================================
        */

        // Add a new layers selection dropdown list
        function addLayersSelection(newLayer) {
            // Define a "error" default value for the returned response
            var response = ['error'];

            // Create the var in which we will store the html options and option groups
            var htmlContent = '';
            var htmlGroup = '';

            // Create the var in which to store all the layers that are available in the app
            var availableLayers = [];

            // Load the layer groups defined in map.js
            for (let i = 0; i < layerGroups.length; i++) {
                var groupName = layerGroups[i].theme;
                var layers = window["theme_" + layerGroups[i].id].getLayers().getArray();

                htmlGroup = '<optgroup label="' + groupName + '">';

                // For each layer in this layer group
                for (let j = 0; j < layers.length; j++) {
                    var layerId = layers[j].get('id');
                    var layerTitle = layers[j].get('title');

                    htmlGroup = htmlGroup + '<option value="' + layerId + '">' + layerTitle + '</option>';

                    // Push this layer in the availableLayers array for further operations
                    availableLayers.push(layerId);

                }

                htmlGroup = htmlGroup + '</optgroup>';
                htmlContent = htmlContent + htmlGroup;
            }

            // Write the final html to insert into the app
            var html =  '<div class="select-layers">' +
                        '<select name="select-layer">' +
                        '<option hidden disabled selected value> -- sélectionnez une couche -- </option>' +
                        htmlContent +
                        '</select>' +
                        '<svg class="layer-parameters"><use xlink:href="#iconeParameters"></use></svg>' +
                        '</div>';
            var selection = $(html).insertBefore('#add-layer');

            // If a layer was specified as an argument, make sure it exists in the app
            if (newLayer) {
                // Make sure this matches an existing choice
                for (let j = 0; j < availableLayers.length; j++) {

                    // If matches, set the html's value
                    if (availableLayers[j] === newLayer) {
                        var select = $(selection).children('select');
                        $(select).val(newLayer);
                        response = ['success'];
                    }
                }

                // If response[0] = 'error' then add to the error the layer's name
                // And remove the select from the GUI
                if (response[0] === 'error') {
                    response.push(newLayer);
                    $(selection).remove();
                }

                // Return the response if a layer was specified as an argument
                return response;

            }
        }
        
        // Add a new layer to the map when "#add-layer" is clicked
        $(document).on('click', '#add-layer', function () {
            addLayersSelection();
            uniqueLayersSelection();
            saveMapCaption();
        });

        // Function to disable multiple selections of one layer
        function uniqueLayersSelection() {
            // Store all the selected layers in an array
            var selectedLayers = [];
            $('.select-layers option:selected').each(function() {
                selectedLayers.push($(this).val());
            });

            // Disable the selected layers in all the others select dropdown lists
            $('.select-layers option:not(selected)').each(function() {
                var notSelected = $(this);

                // Quickly enable all the layers to reset their state
                notSelected.prop('disabled', false);

                // Check if the not-selected option is already selected somewhere else ( = in array selectedLayers)
                for (let i = 0; i < selectedLayers.length; i++) {

                    // The layer is already selected somewhere else, disable it
                    if (notSelected.val() == selectedLayers[i]) {
                        notSelected.prop('disabled', true);
                    }
                }

            });
        }

        // Layers parameters menu
        var layerToRemove;
        $(document).on('click', '.layer-parameters', function() {

            // Hide the menu if the icon is clicked a second time
            if ($(this).hasClass('active') == true && $('.layer-parameters-menu').css('display') !== 'none') {
                $('.layer-parameters-menu').hide();
                layerToRemove = '';

            } else { // Display the menu
                $(this).addClass('active');
                layerToRemove = $(this).closest('.select-layers');
                var position = $(this).position();
                var left = position.left - 60;
                var top = position.top - 24 ;
                $('.layer-parameters-menu').css({'left': left, 'top': top}).show();
            }
        });

        // Hide the menu if the document is clicked somewhere else
        $(document).on('click', function (e) {
            var target = e.target;
            var is_layer_param = false;
            var is_layer_menu = false;

            // Check if it is the layer parameters icon which has been clicked
            if ($(target).hasClass('layer-parameters') == true || $(target).parent().hasClass('layer-parameters') == true) {
                is_layer_param = true;
            }

            // Check if we clicked on an element in the menu
            if ($(target).parent().hasClass('menu-remove-layer') == true) {
                is_layer_menu = true;
            }

            // If the result is false, we clicked oustise the menu elements, hide the menu
            if (is_layer_param == false && is_layer_menu == false) {
                $('.layer-parameters-menu').hide();
            }

        });

        // Remove the layer if the remove ("retirer") button is clicked
        $(document).on('click', '.menu-remove-layer', function() {
            layerToRemove.remove();
            $('.layer-parameters-menu').hide();
            uniqueLayersSelection();
            saveMapCaption();
        });
        
        /* 
        =================================================================================
        Map loading and saves triggers
        =================================================================================
        */

        // Trigger the event for center and zoom fields
        $(document).on('focusout change', '#map-edition .map-control', function () {
            editMapCaptionView();
        });

        // Force focusout on these elements when enter is pressed
        $(document).on('keypress', '#map-edition .map-control', function(e) {
            var self = this;
            var key = e.which;
            if (key == 13) // 13 corresponds to "enter" code 
            {
                $(self).blur(); // Forces focusout() on this field and triggers chapter saving (see below)
            }
        });

        // Trigger the basemap update on field change
        $(document).on('change', '#select-basemap', function () {
            var chapter_id = getActiveChapter();

            editMapCaptionBasemap();
            saveMapCaption(chapter_id);
        });

        // Triggers on select-layers change
        $(document).on('change', '.select-layers', function () {
            // Make sure we disable the already selected layers
            uniqueLayersSelection();

            var chapter_id = getActiveChapter();
            saveMapCaption(chapter_id);
        });

        // Save map caption changes in the database
        function saveMapCaption(chapter_id) {

            // Make sure we only save the map if there are no other queries pending
            if ( $('#map-edition').hasClass('lock') == false ) {
                
                var latitude = $('#map-edition #input-x').val();
                var longitude = $('#map-edition #input-y').val();
                var zoom = $('#map-edition #input-zoom').val();
                var basemap = $('#select-basemap').val();

                /* Make sure we don't duplicate layers while saving */
                // Store all the selected layers in an array
                var selectedLayers = [];
                $('.select-layers option:selected').each(function() {
                    selectedLayers.push($(this).val());
                });

                // Make sure every layer is only called once
                var layers = [];
                for (let i = 0; i < selectedLayers.length; i++) {
                    if (layers.indexOf(selectedLayers[i]) === -1) {
                        layers.push(selectedLayers[i]);
                    }            
                }

                // Turn it into a sting
                var layers = layers.toString();

                /* End of layers control section */

                // We define a timer we need later during the ajax query so we can delay the loader display
                // Reason: if it appears instantaneously it looks kinda distracting or buggy
                // No need for a loader if the query is super fast
                var timer;

                // Save the map
                $.ajax({
                    url: './api.php',
                    method: 'POST',
                    async: true,
                    data: {
                        mode: 'save_chapter_map',
                        chapter_id: chapter_id,
                        latitude: latitude,
                        longitude: longitude,
                        zoom: zoom,
                        basemap: basemap,
                        layers: layers
                    },
                    dataType: 'json',
                    beforeSend: function() {                
                        // While the server processes the data, make sure we cannot edit the related fields with a "lock"
                        $('#map-edition').addClass('lock');

                        // Disable the fields
                        $('#map-edition #input-x').prop('disabled', true); // latitude
                        $('#map-edition #input-y').prop('disabled', true); // longitude
                        $('#map-edition #input-zoom').prop('disabled', true); // zoom
                        $('#select-basemap').prop('disabled', true); // basemap

                        // Lock all the layers select fields
                        $('.select-layers select').each(function () {
                            $(this).prop('disabled', true);
                        });

                        // Lock the map caption with an "invisible" overlay (no clicks allowed)
                        $('#map-overlay-loader').show();

                        // Display the loader if the query takes one more second to be completed
                        timer && clearTimeout(timer);
                        timer = setTimeout(function () {
                            $('#map-overlay-loader').find('.loader-container').show();
                        }, 
                        1000);
                    },
                    success: function(response) {
                        
                    },
                    error: function(response) {
                        console.error(response.error);
                    },
                    complete: function () {
                        // Unlock the map fields
                        $('#map-edition').removeClass('lock');

                        // Enable the fields
                        $('#map-edition #input-x').prop('disabled', false); // latitude
                        $('#map-edition #input-y').prop('disabled', false); // longitude
                        $('#map-edition #input-zoom').prop('disabled', false); // zoom
                        $('#select-basemap').prop('disabled', false); // basemap

                        // Enable all the layers select fields
                        $('.select-layers select').each(function () {
                            $(this).prop('disabled', false);
                        });

                        // Enable the map caption with an overlay
                        $('#map-overlay-loader').hide();

                        // Clear the loader's timeout
                        clearTimeout(timer);
                        $('#map-overlay-loader').find('.loader-container').hide();
                    }
                });
            }
        };

        // Update informations in map view fields once the map view has been moved and save
        mapCaption.on('moveend', function() {
            editMapControls();
            saveMapCaption();
        });

        // Activate chapter on click
        $(document).on('click', '#table-of-contents-list > .selectable', function(event) {
            // Prevent multiple-clicks
            if (!event.detail || event.detail == 1) {
                
                // Save former chapter changes if one chapter was active
                if ($('#table-of-contents-list > .active').length !== 0) {

                    var chapter_id = getActiveChapter();

                    // Save the chapter's content unless it is the introduction
                    if (chapter_id !== 'story-intro') {
                        var chapter_title = escapeHtml($('#chapter-title').val());

                        saveChapterTitle(chapter_id, chapter_title);
                    }

                    // Now save the map's informations
                    saveMapCaption(chapter_id);

                    // Note: we can add the same for paragraph's auto saving later // TODO
                    // Add a class to know if a paragraphs is being edited
                    // If paragraph_editing = true then save this content

                }
                                
                // Actions to perform if the introduction is clicked
                if ($(this).attr('id') == 'story-intro') {
                    // Empty paragraphs displayed in editor
                    emptyParagraphs();

                    // Hide the possibility to add new elements
                    $('#add-paragraph').hide();
                    $('#add-paragraph > #new-paragraph-type').empty();

                    // Write in html and add introduction paragraph
                    readIntroduction();

                    // Read and display the map view
                    readMapView('story-intro');

                    // Hide chapter title as introductions don't have a title
                    $('#chapter-title-group').addClass('hidden');

                    // Then, styling features
                    $('#table-of-contents-list > .active').removeClass('active'); // INFO: activation de l'à-propos
                    $(this).addClass('active');
                    $('#chapter-edition').removeClass('hidden');
                    $('#map-edition').removeClass('hidden');

                } else {
                    /* Actions to perform for chapters */
                    // Allow to add new elements
                    $('#add-paragraph').show();
                    $('#add-paragraph > #new-paragraph-type').empty();
                    generateParagraphTypesList();

                    // Getting chapter index
                    var chapter_id = $(this).attr('id').replace('chapter-', '');

                    // Empty paragraphs displayed in editor
                    emptyParagraphs();

                    // Read chapter title
                    readChapterTitle(chapter_id);

                    // Write in html and add chapter paragraphs
                    readChapterParagraphs(chapter_id);

                    // Read and display the map view
                    readMapView(chapter_id);

                    // Editing active class
                    $('#table-of-contents-list > .active').removeClass('active'); // INFO: activation du chapitre
                    $(this).addClass('active');
                    $('#chapter-edition').removeClass('hidden');
                    $('#map-edition').removeClass('hidden');
                    displayEditingWindow();

                    // Displaying chapter title field in case it was hidden
                    $('#chapter-title-group').removeClass('hidden');
                }

                // Make sure to refresh the map caption
                mapCaption.updateSize();
            }
        });

        // Switch paragraph to "view-mode"
        function switchtoViewMode(editable) {
            $(editable).children('.edit-mode').each(function() {
                $(this).addClass('hidden');
            });
            $(editable).children('.view-mode').each(function() {
                $(this).removeClass('hidden');
            });
        };

        // Switch paragraph to "edit-mode"
        function switchtoEditMode(editable) {
            $(editable).children('.view-mode').each(function() {
                $(this).addClass('hidden');
            });
            $(editable).children('.edit-mode').each(function() {
                $(this).removeClass('hidden');
            });
            // Force focus on input / textarea with class .focus
            $(editable).find('.focus').focus();
        };

        // Activate element editing mode on click
        $(document).on('click', '#paragraph-list > .ui-state-default:not(#add-paragraph) > .paragraph-body > .editable', function() {
            switchtoEditMode(this);
        });
        
        // End element edition mode when user presses "enter" (input type="text" only)
        $(document).on('keypress', '#paragraph-list input[type=text].focus', function(e) {
            var key = e.which;
            var parent = $(this).parents('.editable');
            if (key == 13) // 13 corresponds to "enter" key code 
            {
                $(this).blur();
                switchtoViewMode(parent);
            }
        });

        // Function to get save destination from paragraphTemplate : in 'content' or in 'url' field ?
        // Argument "paragraph" must be 'input' or 'textarea' object
        function getSaveDestination(paragraph) {
            var result;
            paragraphTemplate.forEach(function (e) {
                e.destination.forEach(function (dest) {
                    if ($(paragraph).hasClass(dest.input)) {
                        result = dest.target;
                    }
                })
            })
            return result;
        }

        // Function to trim empty content before saving it
        function trim(content) {
            if (!/\S/.test(content) || content == 'undefined') {
                content = "";
            }
            return content;
        }

        // Function to save paragraphs changes // TODO
        function saveChanges(chapter_id, paragraph_id, destination, content, self) {

            // Send the data to the database
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                    mode: 'save_paragraph_content',
                    chapter_id: chapter_id,
                    paragraph_id: paragraph_id,
                    destination: destination,
                    content: content
                },
                dataType: 'json',
                success: function(response) {
                    // Update paragraph view with new content
                    updateParagraphView(self, response.type, response.content, response.url);
                    // Switch to view mode
                    var editable = $(self).parents('.editable');
                    switchtoViewMode(editable);
                },
                error: function(response) {
                    console.error(response.error);
                }
            });
        }

        // Function to update the targeted paragraph
        function updateParagraphView(self, type, content, url) {
            var target = $(self).parents('.paragraph-body');
            var template = getParagraphTemplate(type).template;

            var body = template(content, url);
            $(target).replaceWith(body);
        };

        // Triggers for saving changes on focusout in a paragraph
        // This doesn't concern input[type="file"] which are treated separately
        $(document).on('focusout', '#paragraph-list input[type="text"], #paragraph-list textarea', function() {
            var self = this;

            var content = escapeHtml($(self).val());
            var chapter_id = getActiveChapter();
            var paragraph_id = getParagraphIndex(self);
            var destination = getSaveDestination(self);
            saveChanges(chapter_id, paragraph_id, destination, content, self);
        });

        // Function to save the chapter's title
        function saveChapterTitle(chapter_id, content) {

            // Make sure we can send the data to the database (to prevent sending twice the same query to the server)

            if ( $('#chapter-title').hasClass('lock') == false ) {
                // Proceed, send the new content to the database
                $.ajax({
                    url: './api.php',
                    method: 'POST',
                    async: true,
                    data: {
                        mode: 'save_chapter_title',
                        chapter_id : chapter_id,
                        content: content
                    },
                    dataType: 'json',
                    beforeSend: function() {
                        // While the server processes the data, make sure we cannot edit the field #chapter-title
                        $('#chapter-title').addClass('lock').prop('disabled', true);
                        $('#chapter-title-group').find('.loader-container').show();
                    },
                    success: function(response) {
                        // Display informations if the title is empty
                        if (!/\S/.test(content) || content == 'undefined') {
                            $('#chapter-' + chapter_id).children('p').html('[Sans titre]');
                        } else {
                            $('#chapter-' + chapter_id).children('p').html(content);
                        }
                    },
                    error: function(response) {
                        console.error(response.error);
                    },
                    complete: function () {
                        // The server is done with processing the data, make sure we can edit the field again
                        $('#chapter-title').removeClass('lock').prop('disabled', false);
                        $('#chapter-title-group').find('.loader-container').hide();     
                    }
                });

            }
        };

        // Stop editing chapter title and save changes when "enter" is pressed
        // INFO: chapter-enter
        // INFO: trigger sauvegarde du titre quand l'utilisateur presse "Entrée" (touche 13)
        $(document).on('keypress', '#chapter-title', function(e) {
            var self = this;
            var key = e.which;
            var parent = $(this).parents('.editable');
            if (key == 13) // 13 corresponds to "enter" code 
            {
                $(self).blur(); // Forces focusout() on this field and triggers chapter saving (see below)
                switchtoViewMode(parent);
            }
        });

        // Save chapter title on field focusout
        $(document).on('focusout', '#chapter-title', function () {
            var chapter_id = getActiveChapter();
            var content = escapeHtml($(this).val());
            saveChapterTitle(chapter_id, content);
        });

        /*
        =================================================================
        Reading the database to write a story map
        =================================================================
        */
        // The main variables and functions used here are located in storymaps_templates.js and load_stories.js
        // If you encounter any "function() is not defined" issue, make sure these two .js scripts are called at the bottom of storytool.php

        // Generating the story overview
        $('#tab-overview').on('click', function() {
            writeStoryMap(overviewMap,'storytool.php');

            // Refresh the map
            overviewMap.updateSize();

        });

        /*
        =================================================================
        Overview tab controls
        =================================================================
        */
        // Show-hide text and images on click
        $('#shrink-tab').click(function () {
            var deploying = false;
            // Check if the tab is deployed or not
            if ($('#story-tab').hasClass('shrink') == true) {
                deploying = true;
            }

            // If we deploy the tab, edit the map position
            if (deploying == true) {
                $('.overview-map').css('grid-column-start', tab_map_limit)
                                .css('grid-column-end', 14);
                overviewMap.updateSize();
            } else { // If we shrink the tab, edit the map position
                $('.overview-map').css('grid-column-start', 1)
                                .css('grid-column-end', 14);
                overviewMap.updateSize();
            }

            // Hide the tab
            $('#story-tab').toggleClass('shrink');
        })

        /*
        =================================================================
        Overview map controls
        =================================================================
        */
        // Adding a new overview map
        overviewMap = new ol.Map({
            target: 'mymap',
            controls: [
                new ol.control.Attribution(),
                new ol.control.ScaleLine()
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat([-61.4204, 16.1876]),
                zoom: 8
            })
        });

        /*================================================================*/
        // Get an array with all the layers available in the app for writing the story (=/= array than in the editor)
        // Adds layers and their legend to the map
        function getAvailableLayers() {
            // Init empty array
            var availableLayers = [];

            // Loop through the layer groups
            for (let i = 0; i < layerGroups.length; i++) {

                // Empty the group's html content to append to the application
                var floatgroup = '';

                // Create the layer group
                var group = layerGroups[i].theme;

                // Start writing the floating legend
                floatgroup = '<div id="' + group + '-float">';

                // Store the layer in a variable
                var layers = window["theme_" + layerGroups[i].id].getLayers().getArray();

                // Loop through the layers in this group
                for (let j = 0; j < layers.length; j++) {

                    // Reset the legend HTML content
                    var legendHTML = '';

                    // Store the layer's informations in a variable
                    var layerId = layers[j].get('id');
                    var layerName = layers[j].get('title');

                    // Get the layer's widgets
                    var layerWidgets = ((layers[j].get('widgets')).split(" "));

                    // Look for the requested legend type : legend or customlegend
                    // If the classic GeoServer legend is needed :
                    for ( var jj = 0; jj < layerWidgets.length; jj++ ) {
                        if (layerWidgets[jj] == 'legend') {
                            // Writing the floating legend part
                            legendHTML =    '<div id="' + layerId + '-legend-float" class="legend-float">' +
                                                '<p>' + layerName + '</p>' +
                                                '<img id="' + layerId + '-float" />' +
                                            '</div>';
                        }
                    }

                    // If the customlegend widget is needed :
                    for ( var kk = 0; kk < layerWidgets.length; kk++ ) {
                        if ( layerWidgets[kk] == 'customlegend' ) {
                            // Getting the 'customlegendTitle' value
                            var customlegendTitle = layers[j].get('customlegendTitle');

                            // Writing the floating legend part
                            var legendHTML =    '<div id="' + layerId + '-legend-float" class="legend-float">' +
                                                    '<p>' + layerName + '</p>' +
                                                    '<div id="'+ layerId +'-customlegendfloat" class="customlegend-float">' +
                                                        '<p>' + customlegendTitle + '<span></span></p>' +
                                                        '<img id="'+ layerId +'-customimgfloat" src="images/assets/legends/' + layerId + '_customlegend.png"/>' +
                                                    '</div>' +
                                                '</div>';
                        }
                    }

                    // Append the HTML content to the floatgroup
                    floatgroup = floatgroup + legendHTML;

                    // Store this layer in the layers' array
                    availableLayers.push(layerId);               
                }

                // Close the floatgroup div
                floatgroup = floatgroup + '</div>';

                // Append this group to the app's html
                $('#floating-legend-container').append(floatgroup);
                
            }

            // Return the result
            return availableLayers;
        }
        // And store this once in each session so the app works faster
        allStoryLayers = getAvailableLayers();

        // Display the legends once the application is ready
        displayUpdateLegends();

        // Add the layers to the map
        function addStorylayers() {
            for (let i = 0; i < allStoryLayers.length; i++) {
                var layer = window[allStoryLayers[i]];
                overviewMap.addLayer(layer);            
            }
        }
        addStorylayers();

        /*
        =================================================================
        Scaling font size
        =================================================================
        */

        $('#font-scale-up').click(function() {
            var size = parseInt($('#story').css('font-size').replace('px',''));
            // Check if it already is max size
            if (size < 20) {
                // Remove "disabled" class for #font-scale-down
                $('#font-scale-down').removeClass('disabled');

                // Calculate the new size
                size = size + 1;

                // Check if new size reached the limit
                if (size == 20) {
                    // Add "disabled" class to #font-scale-up 
                    $('#font-scale-up').addClass('disabled');
                }

                // Update CSS content
                size = size + 'px';
                $('#story').css('font-size', size);

            }

        });

        $('#font-scale-down').click(function() {
            var size = parseInt($('#story').css('font-size').replace('px',''));
            // Check if it already is min size
            if (size > 10) {
                // Remove "disabled" class for #font-scale-up
                $('#font-scale-up').removeClass('disabled');

                // Calculate the new size
                size = size - 1;

                // Check if new size reached the limit
                if (size == 10) {
                    // Add "disabled" class to #font-scale-down 
                    $('#font-scale-down').addClass('disabled');
                }

                // Update CSS content
                size = size + 'px';
                $('#story').css('font-size', size);

            }

        });

        /*
        =================================================================
        Tweaking tab and map width
        =================================================================
        */
        // Defining the default storytab and map grid area when the application loads
        var tab_default_position = 5; // Default tab grid column end
        var tab_map_limit = parseFloat($('#story-tab').css('grid-column-end')); // Default story tab column end position

        // Display the slider
        $('#story-map-ratio-slider').slider({
            value: tab_map_limit,
            min: tab_default_position - 1,
            max: tab_default_position + 2,
            step: 1,
            change: function(event, ui) {
                // Update tab_map_limit
                tab_map_limit = parseFloat($('#story-map-ratio-slider').slider('value'));
                // Refresh the story and map ratio :
                // Move the tab's grid area
                $('#story-tab').css('grid-column-end', tab_map_limit)
                            .css('width', '100%');
                // Move the map's grid area
                $('.overview-map').css('grid-column-start', tab_map_limit)
                                .css('grid-column-end', 14);
                overviewMap.updateSize();
            }
        });

        /*
        =================================================================
        Publish interactions
        =================================================================
        */
        // Function to edit the book's status
        function editBookStatus(status) {
            
            // Ajax query to server
            $.ajax({
                url: './api.php',
                method: 'POST',
                async: true,
                data: {
                        mode:'edit_book_status',
                        status: status            
                    },
                dataType: 'json',
                success: function(response) {
                    // If the new book's status is "published", reload the application
                    if (status == 'published') {
                        document.location.reload(true);  
                    }
                },
                error: function(response) {
                    console.error(response.error);
                }
            });

        };

        // Confirmation modal to call when editing the book's status
        function modalEditBookStatus(status, previous, message) {
            $('#edit-book-status-modal').dialog({
                status: status, // Adding the book's status when the function is called
                previous: previous, // Storing the previous book status value for cancel
                resizable: false,
                width: 400,
                modal: true,
                buttons: {
                    "Confirmer": function () {
                        $(this).dialog("close");
                        // Edit the book's status if the user confirms his choice
                        editBookStatus(status);
                    },
                    Cancel: function () {
                        $(this).dialog("close");
                        // Reset the <select> value if the user cancels
                        $('#storymap-status').val(previous);
                    }
                },
                close: function () {
                    $(this).empty();
                }
            }).append(message);
        };

        // Store previous status in a variable
        var previous_status;

        // Information modal when the book status has been edited
        $('#storymap-status').focusin(function () {

            previous_status = $(this).val(); 

        }).change(function () {

            var status = $(this).val();

            // Writing the correct message depending on the selected status
            if (status == 'draft') {
                
                var message = "Une carte narrative avec le statut de brouillon est consultable et éditable par vous seul. " +
                            "Elle n'est plus accessible aux administrateurs et ne peut donc pas encore être publiée.<br><br>" +
                            "Continuer ?";

            } else if (status == 'pending') {

                var message = "Une carte narrative en attente de publication peut être consultée et éditée par les administrateurs de la plateforme. " +
                            "Ces derniers peuvent ensuite confirmer la publication de votre carte narrative sur la plateforme. " +
                            "Les administrateurs seront notifiés de votre choix par mail, et vous reçevrez une notification par mail lorsque la publication aura été validée. " +
                            "Nous vous conseillons de terminer votre carte narrative avant de la mettre en attente de publication.<br><br>" +
                            "Continuer ?";
                            
            } else if (status == 'published') {

                var message = "Vous allez confirmer l'édition de cette carte narrative. Elle sera consultable par n'importe quel utilisateur sur la plateforme. " +
                            "Merci de vérifier que le contenu est approprié avant publication.<br><br>" +
                            "Continer ?";

            }

            // And display the modal
            modalEditBookStatus(status, previous_status, message);

        });



    }); // End of the document.ready callback

} // End of exernal call once the layers are loaded from the database

/*=======================================================================================================================*/
/* ===================================================================================================================== */
/*                     Functions to be accessible outside this script (used in load_stories.js)                          */
/* ===================================================================================================================== */

/*
=================================================================
Storymap interactivity
=================================================================
*/
// Function to change displayed basemap
function changeBasemap(basemap) {
    // Hide all the basemaps
    for (let i = 0; i < basemaps.length; i++) {
        overviewMap.removeLayer(window[basemaps[i]]);            
    }
    // Add the requested basemap
    overviewMap.addLayer(window[basemap]);
};

/*================================================================*/
// Function to display / update the legends in the floating legend
function displayUpdateLegends(resolution) {

    // Do it for all available layers
    for (let i = 0; i < allStoryLayers.length; i++) {
        var layer   = window[allStoryLayers[i]];
        var layerId = layer.get('id');
        
        // Check if the layer has a classic or custom legend
        var layerWidgets = (layer.get('widgets')).split(" ");

        // If this is a classic legend
        for ( var jj = 0; jj < layerWidgets.length; jj++ ) {
            if (layerWidgets[jj] == 'legend') {

                // Getting legend png from GeoServer
                var source  = layer.get('source').getLegendUrl(resolution) +
                            ('&SLD_VERSION=1.1.0&LEGEND_OPTIONS=fontName:Roboto;fontColor:262236;') +
                            ('fontSize:12;fontAntiAliasing:true;forceLabels:on;');
                
                // Targetting the image tag to edit its source
                var target = layerId + '-float';
                var img = $('#'+target)[0];
                img.src = source;

            } // End of the "if" statement
        } // End of the "classic legend" section

        // If this is a custom legend
        for ( var kk = 0; kk < layerWidgets.length; kk++ ) {
            if ( layerWidgets[kk] == 'customlegend' ) {

            }

        } // End of the "custom legend" section

    } // Done for all the available layers
}

/*================================================================*/
// Display the requested layers
function changeLayers(layers) {
    // Hide all the layers
    for (let i = 0; i < allStoryLayers.length; i++) {
        var layer = window[allStoryLayers[i]];
        var layerId = layer.get('id');
        // Hide the layer
        layer.setVisible(false);         
        // Hide the legend
        var target = $('#' + layerId + '-legend-float');
        target.hide();
    }

    // Add the requested layers
    for (let j = 0; j < layers.length; j++) {
        var layer = window[layers[j]];
        if (layer) {
            var layerId = layer.get('id');
            // Show the layer
            layer.setVisible(true);
            // Show the legend
            var target = $('#' + layerId + '-legend-float');
            target.show();
        }
    }
};