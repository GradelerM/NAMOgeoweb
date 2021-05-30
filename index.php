<!DOCTYPE html>
<html lang="fr">

    <head>
        <!-- Meta tags -->
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">

        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit-no">
        <meta="description" content="Page d'accueil NAMO">
        <meta="author" content="Marie Gradeler (2020)">
        <title>Projet Rivage</title>

        <!-- Importing fonts -->
        <link href="https://fonts.googleapis.com/css2?family=Roboto:500,700" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"> 

        <!-- Styles -->
        <link rel="stylesheet" href="index.css?v=1.1" />

    </head>

    <body>
        <!-- Grid container -->
        <div class="wrapper">
            <div class="container">
                
                <div class="logo">
                <?php echo '<img src="images/assets/logos/'.$horizontal_logo.'" title="logo" alt="logo" />'; ?>
                </div>

                <div class="text">
                    <p><b>Bienvenue sur la plateforme de cartographie narrative NAMO GeoWeb</b></p>
                    <p>
                        La plateforme NAMO est un espace collaboratif pour la rédaction et la publication de 
                        cartes narratives pour documenter un thème, valoriser un projet, etc. Pour commencer 
                        à explorer la carte, cliquez sur le bouton ci-dessous.
                    </p>
                    <p>Bonne exploration !</p>
                    <?php echo $horizontal_logo; ?>
                </div>

                <div class="button">
                    <a href="./map/map.php"><button class="mainButton positivebtn">Accéder à la carte</button></a>
                </div>

            </div>
        </div>

    </body>

</html>