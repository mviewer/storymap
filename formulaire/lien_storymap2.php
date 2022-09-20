<?php
$lien = "/storymap/".$_POST['dossier']."/";
?>

<html>
<head>
  <meta charset="utf-8">
  <title>Story Map</title>
  <link rel="stylesheet" href="form_style.css">
</head>
<body>
<div class="storymap-form">
    <!-- form header -->
    <div class="form-header">
    <h1>Votre Story Map est créée !</h1>
    </div>

    <div class="form-body">
    <h3>Vous pouvez la consulter via ce lien :</h3>
    <h3><a href=<?=$lien?>>Découvrir la Story Map</a></h3>
   </div>

   <div class="form-footer">
   <h1></h1>
   </div>
  </body>
</html>
