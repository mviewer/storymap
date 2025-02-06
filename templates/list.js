"use strict";
var templates = templates || {};
templates.list = function(dom, div) {
    var _dom = dom;
    var _div = div;
    var _tpl;
    var panel_width = function () {
        var width = 0;
        if (document.body.clientWidth >= 768) {
            width = $("#panel-story").width();
        }
        return width;
    };

    this.version = "0.1";
    //Mandatory
    var _updateDom = function() {
        //Add css
        $(_dom.head).append('<link rel="stylesheet" href="templates/list.css" type="text/css" />');
        _div.append('<div id="panel-story"  class="col-sm-12 panel-story-list"></div>');
        $("#panel-story").append(['<nav class="col-sm-3" id="myScrollspy" style="display: none;">',
            '<ul class="nav nav-pills nav-stacked" id="fake-nav"></ul>',
            '</nav>',
            '<div class="col-sm-12" id="content-story"></div>'
        ].join(" "));
        return false;
    };

    var _createList = function(data) {
        $("#fake-nav").append(data.scrollspy_nav);
        $("#content-story").append(data.scrollspy_items);
        $("#content-story .item-story").first().addClass("active");
        $("#fake-nav li").first().addClass("active");            
        let ratio =  window.innerWidth <= 768 ? .3 : .8;          
        const activateItem = function (elem){
            const id = elem.getAttribute('id');
            const anchor = document.querySelector(`#${id}`)
            anchor.parentElement.querySelectorAll('.active').forEach(node => node.classList.remove('active'))
            anchor.classList.add('active');
            let e = document.querySelector(`a[href*='#${id}']`);
                  ks.zoomTo(e.attributes["data-position"].value.split(",").map(Number),
                e.attributes["href"].value,
                e.attributes["data-featureid"].value,
                panel_width());
        }
        const callback = function (entries, observer){
            entries.forEach(function(entry){
                if (entry.intersectionRatio > 0){
                    activateItem(entry.target);
                }
            })
        }
        const spies = document.querySelectorAll('[data-spy]');
        if(spies.length > 0){
            const y = Math.round(window.innerHeight * ratio)
            const observer = new IntersectionObserver(callback,{
                rootMargin: `-${window.innerHeight - y - 1}px 0px -${y}px 0px`
            });
            spies.forEach(function(spy){
                observer.observe(spy)
            })
        }
        var el = $("#item1");
        ks.zoomTo(el.attr("data-position").split(",").map(Number), el.attr("data-bs-target"), el.attr("data-featureid"), panel_width());
    }

    var _renderFeaturesTpl = function(features) {
        var scrollspy_items = [];
        var scrollspy_nav = [];
        var counter = 0;
        for (var i = 0; i < features.length; i++) {
            counter += 1;
            var feature = features[i];
            feature.set("storyid", counter);
            var content = Mustache.render(_tpl, feature.getProperties());
            var position = ol.extent.getCenter(feature.getGeometry().getExtent()).join(",");
            scrollspy_items.push(['<div id="item' + (counter) + '" data-id="' + (counter) + '"class="item-story" data-featureid="' + feature.getId() + '" data-position="' + position + '" data-spy>',
                content,
                '</div>'
            ].join(" "));

            scrollspy_nav.push('<a href="#item' + counter + '" data-featureid="' + feature.getId() + '" data-position="' + position + '" ></a>');
        } //end for

        scrollspy_items.push('<div id="end-lst" class="item-story">');
        return {
            "scrollspy_items": scrollspy_items,
            "scrollspy_nav": scrollspy_nav
        };

    };

    var _renderFeatures = function(features, fields) {
        var scrollspy_items = [];
        var scrollspy_nav = [];
        var counter = 0;
        for (var i = 0; i < features.length; i++) {
            counter += 1;
            var feature = features[i];
            feature.set("storyid", counter);
            var content = {
                title: "",
                text: []
            };
            for (var j = 0; j < fields.length; j++) {
                switch (fields[j].type) {
                    case "title":
                        content.title = '<h2>' + feature.get(fields[j].name) + '</h2>';
                        break;
                    case "text":
                        content.text.push('<div class="my-2 ' + fields[j].name + '">' + (feature.get(fields[j].name) || "") + '</div>');
                        break;
                    case "url":
                        content.text.push('<a class="my-2 btn btn-dark ' + fields[j].name + '" title="Ouvrir dans une nouvelle fenêtre" href="' + (feature.get(fields[j].name) || "") + '" target="_blank" >En savoir plus</a>');
                        break;
                    case "image":
                        content.text.push('<img class="my-2 img-responsive ' + fields[j].name + '" src="' + (feature.get(fields[j].name) || "") + '"></img>');
                        break;
                    case "iframe":
                        content.text.push('<iframe src="' + feature.get(fields[j].name) + '" scrolling="no" frameborder="0" allowfullscreen></iframe>');
                        break;
                    default:
                        content.text.push('<div class="my-2 ' + fields[j].name + '" >' + (feature.get(fields[j].name) || "") + '</div>');
                }
            }

            var position = ol.extent.getCenter(feature.getGeometry().getExtent()).join(",");
            scrollspy_items.push(['<div id="item' + (counter) + '" data-id="' + (counter) + '"class="item-story" data-featureid="' + feature.getId() + '" data-position="' + position + '" data-spy>',
                content.background,
                content.title,
                content.text.join(" "),
                '</div>'
            ].join(" "));

            scrollspy_nav.push('<a href="#item' + counter + '" data-featureid="' + feature.getId() + '" data-position="' + position + '" ></a>');

        } // end for            
        scrollspy_items.push('<div id="end-lst" class="item-story">');
        return {
            "scrollspy_items": scrollspy_items,
            "scrollspy_nav": scrollspy_nav
        };

    };

    //Mandatory
    this.formatFeatures = function(features, opt) {
        var items;
        if (opt.tpl) {
            $.get(opt.tpl, function(template) {
                _tpl = template;
                Mustache.parse(_tpl);
                items = _renderFeaturesTpl(features);
                _createList(items);
            });
        } else {
            items = _renderFeatures(features, opt.fields);
            _createList(items);
        }
        ks.refreshMap();
    };

    document.addEventListener("ks_click", function(e) {
        var currentItem = document.querySelector('#content-story .item-story.active');
        currentItem.classList.remove("active");
        var el = document.getElementById("item"+e.detail.storyid);
        el.scrollIntoView({
            behavior: "smooth", // or "auto" or "instant"                
        });        
        el.classList.add("active");
    });
    $(window).resize(function() {
        var el = $("#item1");
        el[0].scrollIntoView({
            behavior: "smooth", // or "auto" or "instant"                
        });
        ks.zoomTo(el.attr("data-position").split(",").map(Number), el.attr("data-bs-target"), el.attr("data-featureid"), panel_width());
        
    });

    _updateDom();

};