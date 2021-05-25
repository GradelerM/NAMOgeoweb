<!-- To include with php code in administration.php -->

<div id="pending-users-list">
    <h3>Utilisateurs en attente :</h3>
    <?php echo $loader; ?> <!-- class="loader-container", see variable $loader in administration.php -->
    <table class="classic">
        <thead><!-- Filled using administration_interactions.js --></thead>
        <tbody><!-- Filled using administration_interactions.js --></tbody>
    </table>
</div>

</br>

<div id="allowed-users-list">
    <h3>Utilisateurs autorisés :</h3>
    <?php echo $loader; ?> <!-- class="loader-container", see variable $loader in administration.php -->
    <table class="classic">
        <thead><!-- Filled using administration_interactions.js --></thead>
        <tbody><!-- Filled using administration_interactions.js --></tbody>
    </table>
</div>

<!-- Modals -->
<div id="allow-user-modal" title="Ajouter l'utilisateur"></div>
