Storymap
===================

Cette application permet de valoriser des données géolocalisées sous la forme de storymap. Il est possible d'enrichir les données géographiques avec du contenu externe.
Il existe pour le moment 2 templates (liste et carousel) et un mode minimaliste sans template.

----------

### Principe

-------------
Pour créer une nouvelle storymap, il suffit de créer un dossier dans le répertoire stories et d'y déposer les ressources nécessaires à savoir :

**Fichiers ressources**

> - un fichier json `config.json` (obligatoire) qui contient la configuration de la storymap
> - un fichier css (optionnel) qui permet éventuellement de styler la storymap
> - un fichier mst (optionnel) qui est un template Mustache permettant d'effectuer la mise en forme html du contenu info de la storymap.
> - un fichier csv (optionnel) qui permet sur la base d'un champ commun de joindre le contenu de ce fichier aux données géographiques de base.
> - tout autre ressource utilisable par la storymap (images...).


#### Structure du fichier `config.json`
```sh
 {
    splash :{},
    menu : {},
    theme :{},
    tooltip :{},
    map : {},
    data : {},
    extradata: {}    
  }
```

##### splash 
- section permettant de configurer l'écran d'accueil de l'application. Il s'agit d'un paramétrage optionnel
 * prototype 
    **splash.**`iframe`: "url vers la page à utiliser" (str) 
        **ou**
    **splash.**`title`: "titre à utiliser" (str)
    **splash.**`text`: "texte à afficher" (str)

Exemple :
```
  {
  "iframe":"stories/mystory/splash.html"
  }
```

##### menu
 * prototype 
     **menu.**`enabled`: "true" (boolean).
     
Exemple :
```
  {
  "enabled":"true"
  }
```
  
##### theme
 * prototype 
     **theme.**`css`: "url vers le fichier css à utliser pour personnaliser la storymap" (str).
     
Exemple :
```
  {
  "css":"mafeuilledestyle.css"
  }
```
 
##### tooltip 
- configuration des tooltips affichés au survol de la souris sur les entités géographiques de la carte.
 * prototype :
     **tooltip.**`fields`: ["liste des champs à utiliser, séparés par des virgules"] (array)
 * prototype :
     **tooltip.**`template`: Expression Mustache - les champs sont encadrés par des doubles accolades ex: {{champ1}} - ({{champ2}}) (string)
     
Exemple :
```
  {
  "fields":["champ1"]
  }
```   
 
#### map 
- configuration de la carte.
 * prototype 
     **map.**`center`: ["coordonnées (web marcator) du centre de la carte"] (array)
     
Exemple :
```
  {
  "center": [-227028,6182514]
  }
```   
 
 * prototype 
     **map.**`zoom`: "zoom (1 à 20)" (str)
 * descriptif : zoom utilisé lors de l'initialisation de la carte et du zoom sur les entités géographiques.
```
  {
  "zoom": "12"
  }
```  
 * prototype 
     **map.**`overview`: "true" (booleen)
     
 * descriptif : Parmet d'afficher ou de masquer la mini carte de localisation.
 
 Exemple :
```
  {
  "overview: "true"
  }
```   
 * prototype 
     **map.**`url`: "url" (str)
     
 * descriptif : fond carto à utiliser OSM par exemple.
 
 Exemple :
```
  {
  "url": "https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  }
```   
 
 * prototype 
     **map.**`animation`: "true" (booleen)
     
 * descriptif : Activation ou désactivation de l'animation de zoom lors d'un changement de focus sur les entités géographiques.
 * exemple {animation "false"}
 
#### data - configuration du contenu de la storymap.
 * prototype 
     **data.**`title`: "Titre de la story" (str)
     
  Exemple :
```
  {
  "title": "Titre de la story"
  }
```
 
 * prototype 
     **data.**`subtitle`: "Sous-titre de la story" (str)
     
 Exemple :
```
  {
  "subtitle": "En 2017"
  }
```
 
 * prototype 
     **data.**`template`: {`name`: ""}
     
 * descriptif : Template utilisé par la storymap au choix entre carousel et list.   
 
 Exemple :
```
  {
  "template": "carousel"
  }
```

 
 * prototype 
     **data.**`url`: "" (str)
 
 * descriptif : URl vers la source de données. La source de données doit être au format geojson avec une projection EPSG:3857.
   Il peut s'agir d'un fichier statique ou d'une flux WFS.

 Exemple 1 :
```
  {
  "url": "stories/myfirststory/data.geojson"
  }
```

 Exemple 2 :
```
  {
  "url": "http://ows.region-bretagne.fr/geoserver/rb/wfs?request=getFeature&typename=rb:reserve_naturelle_regionale&outputFormat=application/json&srsName=EPSG:3857"
  }
```

 
 * prototype 
     **data.**`id`: "" (str)
     
 * Nécessaire pour les fichiers statiques de type geojson ne possédant pas de propriété id. C'est le cas des fichiers générés par QGIS.
 
 Exemple :
```
  {
  "id": "fid"
  }
```
 
 * prototype 
     **data.**`orderby`: "" (str)
     
 * descriptif : Ce paramètre permet de réordonner (ordre croissant) les entités géographiques sur la base d'un champ possédant des valeurs de type numérique.   
 Via ce paramètre, il est possible de décider du séquencage du contenu de la story. Le champ peut être présent dans le fichier csv associé.
  
 Exemple :
```
  {
  "orderby": "id"
  }
```

 
 * prototype 
     **data.**`tpl`: "" (str)
     
 * Lien vers le template Mustache à utiliser (mise ne forme html des fiches d'informations des entités géographiques). 
 Dans les templates, il est possible d'intéger d'intéger du contenu audio ex : 	<audio src="{{fichier_son}}" controls></audio> où fichier_son correspont à un lien vers un fichier de type audio. Ceci est valable avec le modème Carousel			</div>

 
 Exemple :
```
  {
  "tpl":{tpl: "stories/camaret/camaret.mst"}
  }
```

 
 * prototype :
      **data.**`fields`: [{`name`:"", `type`:"title|text|image|url|iframe|background"}] (array)
     
 * Liste des champs à utiliser pour constituer la fiche d'information de chaque entité géographique. A utiliser si le paramètre template - tpl n'est pas renseigné.
 
 Exemple :
```
  {
  "analyse":{"fields": [     {"name": "nom", "type": "title" }, 
                            {"name": "image", "type": "image"},
                            {"name": "descriptif", "type": "text"},
                            {"name": "site_web", "type": "url"},
                            {"name": "iframe", "type": "iframe"}    ]}
  }
```

A noter : La classe "image-popup" assoviée à  balise html img permet d'agrandir l'image dans une popup.

#### extradata
 * prototype 
     .`extradata`: {`url`: "" (str), `linkfield`: ""} 
     
 * Paramétrage nécessaire pour joindre les données contenues dans un fichier csv aux données géographiques dur la base d'un champ commun.
 Les champs présents dans le fichier csv sont ensuite disponibles pour être intégrés dans la fiche d'information.
 Deux propriétés sont à configurer : url pour indiquer où se situe le fichier, linkfield pour préciser le nom du fichier à utiliser pour effectuer la jointure.
 Le champ doit correspondre au champ "id" de la donnée géographique.
 
 Exemple :
```
  {
  extradata: { "url": "reserve_naturelle_regionale.csv", "linkfield" : "id"}
  }
```

 
 * prototype 
     .`analyse`: {`type`: "", `field`: "", `values`: [], `styles`: {fill: {color: ""}, stroke: {color: "", width: ""}, circle:{radius: ""}, icon: {src:"", scale:""}}} 
     
 * Style unique ou analyse thématique appliquées aux entités géographiques 
 
 Exemple 1 :
```
  "analyse": {
            "type": "single",
			"field": "",
			"values": [],
			"styles": [
                {
                    "icon": {
                        "src" : "stories/camaret/image/pins.svg",
                        "scale" : 0.07
                    }
                }
            ]
		}
```

 Exemple 2 :
```
  "analyse": {
            "type": "single",
			"field": "",
			"values": [],
			"styles": [
                {
                    "fill": {
                        "color": "rgba(206,227,147,0)"
                    },
                    "stroke": {
                        "color": "rgba(206,227,147,0.2)",
                        "width": 2
                    }
                }
            ]
		}
```

Exemple 3 :
```
  "analyse": {
            "type": "categories",
			"field": "mission_code",
			"values": ["territoire","formation"],
			"styles": [
                {
                    "icon": {
                        "src" : "stories/cp/image/pins_territoire.svg",
                        "scale" : 0.07
                    }
                },
                {
                    "icon": {
                        "src" : "stories/cp/image/pins_formation.svg",
                        "scale" : 0.07
                    }
                }
            ]
		}
```
 
 * prototype 
     .`hightlightstyle`: {fill: {color: ""}, stroke: {color: "", width: ""}, circle:{radius: ""}, icon: {src:"", scale:""}}
     
 * Style unique appliqué aux entités géographiques sélectionnées.
 
 Exemple :
```
  {
  "hightlightstyle": {
            "icon": {
                "src" : "stories/camaret/image/pins_light2.svg",
                "scale" : 0.09
            }
       }
  }
```

----------

### Fonctionnalité formulaire

-------------

Le formulaire permet de créer sa storymap sans avoir à modifier les fichiers ressources. Un certain nombre d'informations sont demandées :

**Eléments formulaire**

> - un titre à donner à la storymap ;
> - un sous-titre à donner à la storymap ;
> - un nom de dossier où sera stocké les fichiers de la storymap ;
> - un fichier geojson préparé au préalable ;
> - un texte introductif pour la page d'accueil de la storymap ;
> - une image pour illustrer la page d'accueil de la storymap.

Deux autres éléments peuvent être choisis :

> - le fond de carte utilisé (Voyager, Carto Light (Positron) ou Carto Dark (Dark Matter) ;
> - le niveau de zoom appliqué aux éléments (entre 8 et 15).


