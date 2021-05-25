jQuery(document).ready(function() {

    // Make sure the user can't add spaces in the fields with the .noSpace class
    $('.noSpace').on('keypress', function(e) {
        var key = e.which;
        if (key == 32) { return false; }
    });

    // Function to validate email (not make sur it exists but that the syntax is valid)
    function validateEmail(email) {
        let res = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        return res.test(email);
    }

    // Send data to register new user
    $('#signup-form > input[type=submit]').click(function() {
        var username = $('#signup_username').val();
        var password = $('#signup_password').val();
        var email = $('#signup_mail').val();
        var motivations = $('#signup_motivations').val();

        // Make sure all the fields are filled
        if (!/\S/.test(username) || !/\S/.test(password) || !/\S/.test(email) || !/\S/.test(motivations)) {

            $('#signup-error-message').html('Merci de remplir tous les champs.');

        // Make sure the user entered a valid email (not existing , but valid)
        } else if(validateEmail(email) == false) {

            $('#signup-error-message').html('L\'adresse email n\'est pas valide.');

        } else {

            // Submit values to signup.php
            $.ajax({
                url: "signup.php",
                type: "POST",
                data: {
                    'username': username,
                    'password': password,
                    'email': email,
                    'motivations': motivations
                },
                success: function(response){
                    // If success = true, display a validation message
                    // If there is an error (success=false), display the error message
                    if (response.success == true) {
                        $('#signup-error-message').html('');
                        $('#signup-success-message').html('Merci! Vous serez prévenu par mail dès que votre compte sera activé.');
                    } else {
                        $('#signup-success-message').html('');
                        $('#signup-error-message').html(response.error);
                    }           
                }
            });

        }

    });

    // Make sure the error message disappears when the modal is closed
    $('.close-modal').click(function(){
        $('#signup-error-message').html('');
        $('#signup-success-message').html('');
    });

});