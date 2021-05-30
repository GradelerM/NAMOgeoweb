<?php
// Edit the file with values matching (see .env in docker-compose)
// Rename this file as config.php once you're done (it will be protected by .gitignore)

// ====================================================================================
// PROJECT INFORMATIONS
// ====================================================================================
// Project name and logos
$project_name='Rivage';
$vertical_logo='verticalNAMO.png';
$horizontal_logo='horizontalNAMO.png';

// Noreply mail origin (can keep default)
$noreply_mail='noreply@namo'.$project_name.'.com';

// Link to repository
// Default: NAMO official repositories
// Change if you have your own NAMO repository (for your specific project)
$repo_link='https://github.com/GradelerM/NAMOgeoweb';
$wiki_link='https://github.com/GradelerM/NAMOgeoweb/wiki';

// ====================================================================================
// DATABASE INFORMATIONS
// ====================================================================================
$_SESSION['db_host']='localhost';
$_SESSION['db_port']='5431';
$_SESSION['db_name']='namo';
$_SESSION['db_user']='webconnexion';
$_SESSION['db_password']='webconnect';
?>
