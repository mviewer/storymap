<!DOCTYPE html>
<meta charset="utf-8">
<head>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="bootstrap/css/bootstrap.min.css" rel="stylesheet">
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
</head>

<?php
    //eg : http://kartenn.region-bretagne.fr/ws/transports/dg_chiffres_ok.php?uic=87473223
    if (empty($_GET['id'])) {
        // no data passed by get
        return;
    }
    $id_film = $_GET['id'];           
    $dbh = pg_connect("host=rec-postsig port=5434 dbname=transports user=agathe password=agathe");
     if (!$dbh) {
         echo "Connexion à la Base Impossible avec les paramètres fournis";	          
         die();
     }

// ******** REQUETE DANS LA BASE DE DONNEES *****    
	$sql = "SELECT acteurs, realisation, production, annee_tournage, duree_tournage, date_sortie, nb_entrees, ville_tournage_a    
            FROM film_bzh.tournage_bzh
            WHERE id = '$id_film'";
            
     $result = pg_query($dbh, $sql);    
    
      if (!$result) {
        echo  pg_last_error($dbh);        
         die();
     }
     $film = pg_fetch_all($result)[0];
?> 
 <style>
	body, html {
		margin:0px;
		font-family:"Open Sans", Helvetica, arial, sans-serif !important;
		position:relative;
		line-height: 1.1!important;
		background: none transparent;
	}

	@font-face {
        font-family: "brandon_black";
        src: url('../../css/fonts/Brandon/Brandon_blk.otf');
        }
    @font-face {
	    font-family: "roboto_black";
	    src: url('../../css/fonts/Roboto/Roboto-Black.ttf');
	}
	@font-face {
	    font-family: "roboto_light";
	    src: url('../../css/fonts/Roboto/Roboto-Light.ttf');
	}    
	.container{
		/*width: 50%;*/
		padding-left: 0px;
	}
	.chiffres{
		font-family: "brandon_black";
		color:#eec126;
		font-size: 30px;
	}
	.sub-title{
		font-family: "roboto_black";
		color:#eec126;
		font-size: 15px;
	}
	.title{
		font-family: "roboto_black";
		font-size: 15px;
		color: black;
	}
	.info{
		font-family: "roboto_light";
		font-size: 15px;
	}
	.row{
		margin-bottom: 20px;
		margin-top: 20px;
	}
	.localisation {
    background-image: url(image/placeholder.svg);    
    background-repeat: no-repeat;
    background-size: 13px 14px;
    /*margin-left: 30px;*/

	
</style>
<body>  
<div class="container">
	<div class="row" id="real_prod">
		<div class="col-xs-6">
			<div class="title">RÉALISATION </div>
			<div class="info"><?php echo $film["realisation"];?></div>
		</div>
		<div class="col-xs-6">
			<div class="title"> PRODUCTION </div>
			<div class="info"><?php echo $film["production"];?></div>
		</div>		
	</div>
	<div id="acteur">
		<div class="title"> ACTEURS </div>
		<div class="info"><?php echo $film["acteurs"];?></div>	
	</div>
	<div class="row" id="annee">
		<div class="col-xs-6">
			<div class="title"> ANNÉE DE TOURNAGE <span class="info"><?php echo $film["annee_tournage"];?></span></div>
		</div>
		<div class="col-xs-6">
			<div class="title"> DATE DE SORTIE <span class="info"><?php echo $film["date_sortie"];?></span></div>
		</div>	
	</div>
	<div class="row" id="number">
		<div class="col-xs-6">
			<div class="col-xs-4" style="padding-left:0px;">
				<img src="image/clapperboard.svg" style="width:70px;"/>
			</div>
			<div class="col-xs-8" style="padding-left:0px;">
				<div class="chiffres"><?php echo $film["duree_tournage"];?></div>
				<div class="sub-title"> Nombre de jours de tournage en Bretagne </div>
			</div>
		</div>	
		<div class="col-xs-6">
			<div class="col-xs-3" style="padding-left:0px; margin-left:-15px;">
				<img src="image/ticket.svg" style="width:70px;"/>
			</div>
			<div class="col-xs-9" style="padding-left:15px;">
				<div class="chiffres"><?php echo number_format($film["nb_entrees"],0,',',' ');?></div>
				<div class="sub-title"> Nombre d'entrées au cinéma</div>
			</div>
		</div>		
	</div>
	<div id="lieux">
		<div class="title localisation" style="padding-left:16px;"> LIEUX DE TOURNAGE EN BRETAGNE </div>
		<div class="info"><?php echo $film["ville_tournage_a"];?></div>	
	</div>
</div>
</body>

</html>

 <?php  			
    // free memory
    pg_free_result($result);    
    // close connection
     if (!$dbh) {
        pg_close($dbh);
     }
?>