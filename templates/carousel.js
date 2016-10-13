"use strict";
var templates = templates || {};
templates.carousel = function (domElement, options) {
    var _domElement = domElement;
    var _options = options;
    
    var _setProgress = function (value) {
        $('.progress-bar').css('width', value+'%').attr('aria-valuenow', value);
    };

    this.version = "0.1";    
    //Mandatory
    this.updateDom = function () {
        //Add css
        $('head').append('<link rel="stylesheet" href="css/carousel.css" type="text/css" />');
        _domElement.addClass("panel-story-carousel");
        _domElement.css("width", '50%');
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
        _domElement.append(tpl);
        $("#template").append([
            '<div class="carButton precButton" style="opacity: 1;"><a data-actual-slide="0" onclick="$(\'.carousel\').carousel(parseInt(this.getAttribute(\'data-actual-slide\'))-1);"> </a></div>',
            '<div class="carButton nextButton" style="opacity: 1;"><a data-actual-slide="0" onclick="$(\'.carousel\').carousel(parseInt(this.getAttribute(\'data-actual-slide\'))+1);"> </a></div>',
            '<div class="progress">',
            '<div class="progress-bar progress-bar-custom" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%;">',
                '<span class="sr-only">0% Complete</span>',
            '</div>',
        '</div>'
        ].join(""));
        return false;
    };
    //Mandatory
    this.formatLi = function (domTarget, featureId, location, cls, title) {
        return '<li data-target="#myCarousel" data-slide-to="'+domTarget+'" data-featureid="'+featureId+'" data-position="'+location+'" class="'+cls+'" ></li>'
    };
    //Mandatory
    this.formatFeatures = function (items, lis) {
        $(".carousel-indicators").append(lis);
        $(".carousel-inner").append(items);
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

};