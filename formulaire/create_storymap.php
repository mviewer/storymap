<?php
header('Content-type: text/html; charset=utf-8');
// Permet l'affichage des erreurs sur la page
error_reporting(E_ALL);
ini_set("display_errors", 1);

function copier_fichier($source, $destination) {
	// On copie et on colle un fichier depuis un chemin source vers un chemin de destination
	if (!copy($source, $destination)) {
    	   //echo " Fichier non copié. ";  
	}  
	else {  
    	   //echo " Fichier correctement copié. ";  
	} 

}

function custom_copy($src, $dst) { 
  
    // On ouvre le répertoire source
    $dir = opendir($src); 
  
    // Make the destination directory if not exist
    mkdir($dst); 
  
    // On parcours les fichiers du répertoire
    while( $file = readdir($dir) ) { 
  
        if (( $file != '.' ) && ( $file != '..' )) { 
            if ( is_dir($src . '/' . $file) ) 
            { 
  
                // Appel récursif pour un sous répertoire
                custom_copy($src . '/' . $file, $dst . '/' . $file); 
  
            } 
            else { 
                copy($src . '/' . $file, $dst . '/' . $file); 
            } 
        } 
    } 
  
    closedir($dir);
}

function creer_dossier($nomdedossier) {
// On crée un nouveau dossier au chemin renseigné
    if (!file_exists('../stories/'.$nomdedossier)) {
       if (mkdir('../stories/'.$nomdedossier, 0755, true)) {
          //echo " Le dossier a été créé. ";
       }
       else {
          //echo " Le dossier n'a pas été créé. ";
       }
    }
    else {
       //echo " Le dossier existe déjà. ";
    }

}

function supprimer_dossier($dossier) {
// On supprime le dossier et son contenu s'il existe déjà
   if (is_dir($dossier)) { 
     //echo " Le dossier ".$dossier."existe.";
     $objects = scandir($dossier);
     foreach ($objects as $object) { 
       if ($object != "." && $object != "..") { 
         if (is_dir($dossier. DIRECTORY_SEPARATOR .$object) && !is_link($dossier."/".$object))
           supprimer_dossier($dossier. DIRECTORY_SEPARATOR .$object);
         else
           unlink($dossier. DIRECTORY_SEPARATOR .$object); 
       } 
     }
     rmdir($dossier); 
     //echo " Le dossier ".$dossier." a été supprimé.";
   } 
 }

function upload_image($dossier, $file) {
$target_dir = dirname(__FILE__).'/'.$dossier.'/image/';
$tmp_file = $file['tmp_name'];
$dest_file = $file['name'];
//echo $tmp_file;
if( !is_uploaded_file($tmp_file) )
    {
        //echo(" Le fichier est introuvable. ");
    }

    // on vérifie maintenant l'extension
    $type_file = $file['type'];

    if( !strstr($type_file, 'jpg') && !strstr($type_file, 'png') && !strstr($type_file, 'jpeg'))
    {
        //echo(" Le fichier n'est pas une image. ");
    }

    // on copie le fichier dans le dossier de destination
    $name_file = $file['name'];

    if(move_uploaded_file($tmp_file, $target_dir.$dest_file)) {
        //echo " Le fichier a bien été uploadé. ";
    }
    else {
        //echo " Impossible de copier le fichier. ";
    }
}

function upload_geojson($dossier, $file) {
$target_dir = dirname(__FILE__).'/'.$dossier;
$tmp_file = $file['tmp_name'];
$dest_file = $file['name'];
//echo '---'.$file['type'].'---';
if( !is_uploaded_file($tmp_file) )
    {
        //echo(" Le fichier est introuvable. ");
    }

    // on vérifie maintenant l'extension
    $type_file = $file['type'];

    if( !strstr($type_file, 'geojson') && !strstr($type_file, 'application/octet-stream'))
    {
        //echo(" Le fichier n'est pas un geojson. ");
    }

    // on copie le fichier dans le dossier de destination
    $name_file = $file['name'];

    if(move_uploaded_file($tmp_file, $target_dir.'/'.$dest_file)) {
        //echo " Le fichier a bien été uploadé. ";
    }
    else {
        //echo " Impossible de copier le fichier. ";
    }
}

// --------------------- SCRIPT DE CREATION --------------------- //

// on v�rifie que le dossier n'existe pas
// s'il existe on supprime le dossier et son contenu
//echo getcwd();

$res = 0;
if (is_dir('../stories/'.$_POST['dossier'].'/')) { 
     $res = 1;
}
supprimer_dossier('../stories/'.$_POST['dossier'].'/');

// création du dossier qui contiendra la storymap
creer_dossier($_POST['dossier']);

// copie des fichiers utiles à la storymap
copier_fichier('config_base.json','../stories/'.$_POST['dossier'].'/config.json');
copier_fichier('style.css','../stories/'.$_POST['dossier'].'/style.css');
copier_fichier('splash_base.html','../stories/'.$_POST['dossier'].'/splash.php');
custom_copy('./img', '../stories/'.$_POST['dossier'].'/image');

// On récupère les informations du fichier json qui seront modifiées par le formulaire
$Json_content = file_get_contents("../stories/".$_POST['dossier']."/config.json");
$obj = json_decode($Json_content, true);

// On upload les différents fichiers
upload_image('../stories/'.$_POST['dossier'], $_FILES['img']);
upload_geojson('../stories/'.$_POST['dossier'], $_FILES['geojson']);

// On modifie le fichier json à partir des données du formulaire
$obj['splash']['iframe'] = 'stories/'.$_POST['dossier'].'/splash.php';
$obj['map']['url'] = $_POST['level'];
$obj['map']['zoom'] = $_POST['zoom'];
$obj['data']['title'] = $_POST['titre'];
$obj['data']['subtitle'] = $_POST['sous-titre'];
$obj['data']['url'] = 'stories/'.$_POST['dossier'].'/'.$_FILES['geojson']['name'];
$obj['data']['analyse']['styles']['0']['icon']['src'] = 'stories/'.$_POST['dossier'].'/image/patrimoine.png';
$obj['data']['hightlightstyle']['icon']['src'] = 'stories/'.$_POST['dossier'].'/image/patrimoine_highlight_f.png';
$choix = $_POST['choix'];
if ($choix =='template1') {
$obj['data']['tpl'] = 'stories/'.$_POST['dossier'].'/template1.mst';
copier_fichier('template1.mst','../stories/'.$_POST['dossier'].'/template1.mst');
}
if ($choix == 'template2') {
$obj['data']['tpl'] = 'stories/'.$_POST['dossier'].'/template2.mst';
copier_fichier('template2.mst','../stories/'.$_POST['dossier'].'/template2.mst');
}

// on enregistre la nouvelle version du fichier json
$newJsonString = json_encode($obj, JSON_UNESCAPED_UNICODE);
file_put_contents('../stories/'.$_POST['dossier'].'/config.json', $newJsonString);


// ------------------------------------------------ PAGE ACCUEIL STORY MAP HTML ------------------------------------------------//
// On récupère les informations du fichier splash.html qui seront modifiées par le formulaire
$titre = '"'.$_POST['titre'].'"';
$soustitre = '"'.$_POST['sous-titre'].'"';
$texte = '"'.$_POST['texte'].'"';
$img = "'image/".$_FILES['img']['name']."'";
$url = '"'.$_POST['url'].'"';
$button = "<div></div>";
if ($url != '"url"') {
  $button = "<div class='butn' style='margin-top:20px;'>
              <a type='button' class='ks-btn' title='Ouvrir dans une nouvelle fenêtre' href=<?=$url?> target='_blank'>En savoir plus</a>
            </div>";
}


$pageHtml = "<!DOCTYPE html>
<meta charset='utf-8'>
<head>
    <title>splash</title>
    <meta http-equiv='X-UA-Compatible' content='IE=edge'>
    <meta charset='UTF-8' name='viewport' content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'>    
        <link rel='stylesheet' href='../../lib/bootstrap_3.3.7/css/bootstrap.min.css'>
        <link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/cssgram/0.1.10/cssgram.min.css'>
  <style>
  @font-face {
    font-family: 'spotka_black';
    src: url('../../css/fonts/region_bretagne/spotkablack.ttf');
}
@font-face {
    font-family: 'spotka_bold_sc';
    src: url('../../css/fonts/region_bretagne/spotkabold-sc.ttf');
}
@font-face {
    font-family: 'spotka_bold';
    src: url('../../css/fonts/region_bretagne/spotkabold.ttf');
}
@font-face {
    font-family: 'spotka_medium';
    src: url('../../css/fonts/region_bretagne/spotkamedium.ttf');
}
@font-face {
    font-family: 'spotka_regular';
    src: url('../../css/fonts/region_bretagne/spotkaregular.ttf');
}
@font-face {
    font-family: 'spotka_alternate_black';
    src: url('../../css/fonts/region_bretagne/spotka-alternatebold.ttf');
}
@font-face {
    font-family: 'spotka_alternate_bold';
    src: url('../../css/fonts/region_bretagne/spotka-alternatebold.ttf');
}
@font-face {
    font-family: 'spotka_alternate_medium';
    src: url('../../css/fonts/region_bretagne/spotka-alternatemedium.ttf');
}
@font-face {
    font-family: 'spotka_alternate_regular';
    src: url('../../css/fonts/region_bretagne/spotka-alternateregular.ttf');
}
    body, html {
        margin:0px;
        position:relative;
        font-size:11px;
        color: #797979;
        background-size: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    } 
    .bandeau{
      text-align: center;
    }
    .story{
      color:#BA88A4;
      font-family: 'spotka_alternate_regular';
      font-size: 40px;
      text-align: center;      
      margin-top: -3%;
    }       
    .title{
      color:black;
      font-family: 'spotka_bold_sc';
      font-size: 34px;
      letter-spacing: -1.5px;
      text-align: center;
    
    }    
    .subtitle{
      color:black;
      font-family: 'spotka_bold';
      text-align: center;
    }
    .corps{
      margin-top: 10px;
      font-family: 'Trebuchet MS', 'Arial', Sans-serif;
      color:#333;
    }  
    #intro.row{
      background-color: rgb(255, 255, 255);
      padding-bottom:4%;
    }
    #next{
      margin-left: 48%;
      margin-top: 2%;
    }
    #next .story-btn-next {            
        border-radius: 52px;
    }
    #next .story-btn-next a {
        display: block;
        width: 40px;
        height: 40px;             
        background: url(image/nextButton_magenta.png) 0 0 no-repeat;
        cursor: pointer;
    }
    #next .story-btn-next a:hover {
        background: url(image/nextButton_magenta.png) 0 -40px no-repeat;
    }
    .butn{
      text-align: center;
    }
    .ks-btn {
        font-family: 'Trebuchet MS', Arial, Sans-serif;
      border-left: solid 5px;
    border-left-color: #1a1a1a;    
      box-shadow: 1px 1px 0 rgba(0,0,0,.3);
      color: #333;
      background: #eee;
      transition: all .1s ease;
      transition: border 1s ease;
      text-align: center;
      padding: 6px 12px;
      margin-bottom: 0;
      display: inline-block;
      font-size: 14px;
      line-height: 1.42857143;
      cursor: pointer;
      margin: 3px;
  }
    .ks-btn:hover {
      border-color: #1a1a1a #1a1a1a #1a1a1a #000;
      color: #fff;
      background: #1a1a1a;
      text-decoration: none;
  }   

    @media (min-width: 768px) {     
        .ks-xs {
                display:none;
        }
        .ks-bg {
            display:block;
        }
        .title {
           font-size: 34px!important;
        }
        .subtitle {
           font-size: 30px!important;
           margin-top: -12px;
        }
        .corps {
           font-size: 16px;
           line-height: 1.3;
           text-align: justify;
        }
    }
    @media (max-width: 768px) {    
        .ks-xs {
            display:block;
         }
        .ks-bg {
            display:none;
         }
         .subtitle {       
            margin-top: 0px;
         }
        #filtre{
          display: none;
        }
        #intro.row{
          padding: 30px 15px;
        }
        .corps{
          font-size: 12px!important;
          text-align: justify;

        }
        .title{
          font-size: 20px!important;
        }
        .subtitle{
          font-size: 15px!important;
        }
        #next{
          padding-top: 5%;
          padding-left: 40%;

        }
    }     
    
  </style>
</head> 
<body>  
  <div class='container-fluid'>          
    <div class='row' id='intro'>        
      <div class=' col-sm-offset-2 col-sm-8'> 
          <div class='bandeau'>
            <img src='image/bandeau_region_magenta_top.svg'>
          </div>
          <div class='story'><img src='image/patrimoine_magenta.svg' style='margin-top:-1%;width:3%'>KARTENN STORY<img src='image/patrimoine_magenta.svg' style='margin-top:-1%;width:3%'></div>
           <div id='titre' class='title'> <?=$titre?> </div>  
            <div class='subtitle'> <?=$soustitre?> </div>
            <div class='parcours'>
            <img src=<?=$img?> style='width:100%;margin:10px 0px 10px 0px;'>
          </div>
            <div class='corps'>
              <?=$texte?> 
          </div>
          $button
            <div id='next'>
            <div class='story-btn story-btn-next' style='opacity: 1;'>
                <a onclick='next();'> </a>
            </div>
       </div>     
        </div>   
      </div> 
    </div>      
  </div>
  <script>
    var next = function () {        
        parent.postMessage('splash-next', window.location.origin);
    };
   </script>
</body>
</html>
";

$newFile = 'splash';
$open = fopen('../stories/'.$_POST['dossier'].'/'.$newFile.'.php','w');
fwrite($open,$pageHtml);
fclose($open);

// ------------------------------------------------ PAGE LIEN STORY MAP ------------------------------------------------//

$lien = "../".$_POST['dossier']."/";
if ($res == 1) {
  $message = "Le dossier d'une storymap portant le même nom a été supprimé.";
}
else {
  $message = "Le dossier de la storymap a été créé.";

}

?>

<html>
<head>
  <meta charset="utf-8">
  <title>Story Map</title>
  <link rel="stylesheet" href="form_style.css">
</head>
<body>
<form class="storymap-form" action="" method="post">
    <!-- form header -->
    <div class="form-header">
    <h1>Votre Story Map est créée !</h1>
    </div>

    <div class="form-body">
    <p><?=$message?></p>
    <h3>Vous pouvez la consulter via ce lien :</h3>
    <a href=<?=$lien?> target="_blank">Découvrir la Story Map</a>
   </div>

   <div class="form-footer">
   <h1></h1>
</form>
  </body>
</html>
