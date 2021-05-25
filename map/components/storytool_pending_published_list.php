<hr>
<!-- List the pending books -->
<p style="margin-bottom: 12px; text-align: left;">
    Liste des cartes narratives en attente de validation :
</p>
<div id="pending-books-list-container">
    <!-- Display a loader during the query  -->
    <?php echo $loader;?>
    <table id="pending-books-list" class="classic">
        <!-- Content generated with PHP fetch query -->
    </table>
</div>

<hr>
<!-- List the published books -->
<p style="margin-bottom: 12px; text-align: left;">
    Liste des cartes narratives publiées :
</p>
<div id="published-books-list-container">
    <!-- Display a loader during the query  -->
    <?php echo $loader;?>
    <table id="published-books-list" class="classic">
    <!-- Content generated with PHP fetch query -->
    </table>
</div>