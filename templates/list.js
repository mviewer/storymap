"use strict";
var templates = templates || {};
templates.list = function (dom, div, options) {
    var _dom = dom;
    var _div = div;
    var _options = options;    
    var panel_width = $(dom).width() * parseInt(options.width) / 100;

    this.version = "0.1";    
    //Mandatory
    var _updateDom = function () {
        //Add css
         $(_dom.head).append('<link rel="stylesheet" href="templates/list.css" type="text/css" />');
         _div.append('<div id="panel-story"  class="col-sm-12 panel-story-list" style="width:'+options.width+';" ></div>');
         $("#panel-story").append(['<nav class="col-sm-3" id="myScrollspy" style="display: none;">',
                  '<ul class="nav nav-pills nav-stacked" id="fake-nav"></ul>',
                '</nav>',        
                '<div class="col-sm-12" id="content-story"></div>'].join(" "));
        return false;
    };    
    //Mandatory
    this.formatFeatures = function (features, fields) {
            var scrollspy_items = [];           
            var scrollspy_nav = [];           
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
                
                scrollspy_items.push(['<div id="'+(counter)+'" class="item-story" data-featureid="'+feature.getId()+'" data-position="'+position+'" >',
                            content.title,
                            content.text.join(" "),
                            content.image.join(" "),
                            '</div>'].join(" "));                            
                
                scrollspy_nav.push('<li data-target="'+counter+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" ><a href="#'+counter+'">'+content.title+'</a></li>');                
                     
              
            }
            scrollspy_items.push('<div id="end-lst" class="item-story">'); 
            $("#fake-nav").append(scrollspy_nav);
            $("#content-story").append(scrollspy_items);
            $("#content-story .item-story").first().addClass("active");
            $("#fake-nav li").first().addClass("active");
            $("#panel-story").scrollspy({ target: '#myScrollspy', offset: 200 });
            
            $("#myScrollspy").on('activate.bs.scrollspy', function (e) {
                $("#content-story .item-story.active").removeClass("active");
                ks.zoomTo(e.target.attributes["data-position"].value.split(",").map(Number) ,
                        e.target.attributes["data-target"].value, 
                        e.target.attributes["data-featureid"].value,
                        panel_width );                     
                 $('#'+e.target.attributes["data-target"].value).addClass("active");
            });
            var el = $("[data-target='1']");
            ks.zoomTo(el.attr("data-position").split(",").map(Number), el.attr("data-target"), el.attr("data-featureid"), panel_width);
            //$('#'+el.attr("data-target")).addClass("active");            
            document.addEventListener("ks_click", function (e) {
                 document.getElementById(feature.get("storyid")).scrollIntoView({
                    behavior: "smooth", // or "auto" or "instant"                
                });
            });     
           
    };
    
    _updateDom();

};