"use strict";
var templates = templates || {};
templates.carousel = function (dom, div, options) {
    var _dom = dom;
    var _div = div;
    var _options = options;
    var panel_width = $(dom).width() * parseInt(options.width) / 100;
    
    var _setProgress = function (value) {
        $('.progress-bar').css('width', value+'%').attr('aria-valuenow', value);
    };

    this.version = "0.1";    
    //Mandatory
    var _updateDom = function () {
        //Add css
        $(_dom.head).append('<link rel="stylesheet" href="templates/carousel.css" type="text/css" />');
        _div.append('<div id="panel-story"  class="col-sm-12 panel-story-carousel" style="width:'+options.width+';" ></div>');        
       
        var tpl = ['<div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="false">',
                '<ol class="carousel-indicators" style="display: none;"></ol>',
                '<div class="carousel-inner" role="listbox"></div>',     
                '<a class="left carousel-control" href="#myCarousel" role="button" data-slide="prev">',
                  '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>',
                  '<span class="sr-only">Previous</span>',
                '</a>',
                '<a class="right carousel-control" href="#myCarousel" role="button" data-slide="next">',
                  '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>',
                  '<span class="sr-only">Next</span>',
                '</a>',
              '</div>'].join("");
        $("#panel-story").append(tpl);
        _div.append([
            '<div class="carButton precButton" style="opacity: 1;">',
                '<a data-actual-slide="0" onclick="$(\'.carousel\').carousel(parseInt(this.getAttribute(\'data-actual-slide\'))-1);"> </a>',
            '</div>',
            '<div class="carButton nextButton" style="opacity: 1;">',
                '<a data-actual-slide="0" onclick="$(\'.carousel\').carousel(parseInt(this.getAttribute(\'data-actual-slide\'))+1);"> </a></div>',
            '<div class="progress">',
            '<div class="progress-bar progress-bar-custom" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">',
                '<span class="sr-only">0% Complete</span>',
            '</div>',
        '</div>'
        ].join(""));
        return false;
    };   
    //Mandatory
    this.formatFeatures = function (features, fields) {
        var carousel_items = [];
        var carousel_indicators = [];
        var counter = 0;
        for (var i = 0; i < features.length; i++) {
            counter+=1;
            var feature = features[i];
            feature.set("storyid", counter);
            var content = {title:"", text:[] , image : []};                
            for (var j = 0; j < fields.length; j++) {                    
                switch( fields[j].type) {
                    case "title":
                        content.title = '<h2>'+ feature.get(fields[j].name) + '</h2>';
                        break;
                    case "text":
                        content.text.push('<p>' + (feature.get(fields[j].name) || "") + '</p>');
                        break;
                    case "url":
                        content.text.push('<a title="Ouvrir dans une nouvelle fenêtre" href="'+(feature.get(fields[j].name) || "")+'" target="_blank" >Lien</a>');
                        break;
                    case "image":
                        content.image.push('<img src="'+ (feature.get(fields[j].name) || "") + '" class="img-responsive"></img>');
                        break;
                    default:
                        content.text.push('<p>' + (feature.get(fields[j].name) || "") + '</p>');
                }
            }               
            
            var position = ol.extent.getCenter(feature.getGeometry().getExtent()).join(",");
            
            carousel_items.push(['<div id="'+(counter)+'" class="item" data-featureid="'+feature.getId()+'" data-position="'+position+'" >',
                        content.title,
                        content.text.join(" "),
                        content.image.join(" "),
                        '</div>'].join(" "));
                        
                            
            carousel_indicators.push('<li data-target="#myCarousel" data-slide-to="'+(counter-1)+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" ></li>');
            
        }
        
        $(".carousel-indicators").append(carousel_indicators);
        $(".carousel-inner").append(carousel_items);
        $(".carousel-indicators .item").first().addClass("active");
        $(".carousel-inner .item").first().addClass("active");
        $(".carousel").carousel();
        $(".carousel").on('slide.bs.carousel', function (e) {
            var direction = (e.direction === "right")?-1:+1;
            var actual_slide = parseInt($(".nextButton a").attr("data-actual-slide"));                   
            ks.zoomTo(e.relatedTarget.attributes["data-position"].value.split(",").map(Number) ,
                    e.relatedTarget.attributes["id"].value, 
                    e.relatedTarget.attributes["data-featureid"].value,
                    $(window).width() / 2 );
            _setProgress( (parseInt(e.relatedTarget.attributes["id"].value) )  / $(".item").length * 100);
            
            
            $(".carButton a").attr("data-actual-slide", actual_slide+direction);
            
        });
        var el = $("[data-slide-to='0']");
        ks.zoomTo(el.attr("data-position").split(",").map(Number), el.attr("id"), el.attr("data-featureid"), $(window).width() / 2);
        _setProgress( parseInt(1 / $(".item").length * 100)); 

         document.addEventListener("ks_click", function (e) {
             $('.carousel').carousel(e.detail.storyid -1);
             $(".carButton a").attr("data-actual-slide", e.detail.storyid -1);
        });
    }
    
    _updateDom();

};