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
                var content = {title:"", text:[] };                
                for (var j = 0; j < fields.length; j++) {                    
                    switch( fields[j].type) {
                        case "title":
                            content.title = '<h2>'+ feature.get(fields[j].name) + '</h2>';
                            break;
                        case "text":
                            content.text.push('<div class="'+fields[j].name+'">' + (feature.get(fields[j].name) || "") + '</div>');
                            break;
                        case "url":
                            content.text.push('<a class="'+fields[j].name+'" title="Ouvrir dans une nouvelle fenêtre" href="'+(feature.get(fields[j].name) || "")+'" target="_blank" >En savoir plus</a>');
                            break;
                        case "image":
                            content.text.push('<img class="img-responsive '+fields[j].name+'" src="'+ (feature.get(fields[j].name) || "") + '"></img>');
                            break;
                        case "iframe":
                            content.text.push('<iframe src="'+feature.get(fields[j].name) +'" scrolling="no" frameborder="0" allowfullscreen></iframe>');
                            break;      
                        default:
                            content.text.push('<div class="'+fields[j].name+'" >' + (feature.get(fields[j].name) || "") + '</div>');
                    }
                }               
                
                var position = ol.extent.getCenter(feature.getGeometry().getExtent()).join(",");
                
                scrollspy_items.push(['<div id="'+(counter)+'" class="item-story" data-featureid="'+feature.getId()+'" data-position="'+position+'" >',
                            content.title,
                            content.text.join(" "),                            
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
                        
            document.addEventListener("ks_click", function (e) {
                 document.getElementById(e.detail.storyid).scrollIntoView({
                    behavior: "smooth", // or "auto" or "instant"                
                });
                var el = $("[data-target='"+e.detail.storyid+"']");
                el.addClass("active");
            });     
           
    };
    
    _updateDom();

};