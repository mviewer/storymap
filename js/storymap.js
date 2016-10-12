var _map, featureOverlay, _options, _conf, vectorLayer, info;
        var _init = function  (options) {
              _options = options;
              if (options.splash) {
                $("#splash").show();
                $("#splash h1").text(options.splash.title);
                $("#splash p").text(options.splash.text);
              }
              $("#content-title h1").text(options.data.title);
              $("#map").css("width",options.map.width);    
              if (options.data.presentation === "carousel") {
                $("#panel-story").addClass("panel-story-carousel");
                $("#panel-story").css("width", '50%');
                var test = ['<div id="myCarousel" class="carousel slide" data-ride="carousel" data-interval="false">',
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
                $("#panel-story").append(test);                 
    
              } else {
                $(".progress").remove();
                $(".carButton").remove();
                $("#panel-story").addClass("panel-story-list");
                $("#panel-story").css("width", 100 - parseInt(options.map.width) + '%');
                $("#panel-story").append(['<nav class="col-sm-3" id="myScrollspy" style="display: none;">',
                      '<ul class="nav nav-pills nav-stacked" id="fake-nav"></ul>',
                    '</nav>',        
                    '<div class="col-sm-12" id="content-story"></div>'].join(" "));
              }     
              
              var options_style = {
                  fill: new ol.style.Fill(options.data.style.fill),
                  stroke: new ol.style.Stroke(options.data.style.stroke)                  
                };     
                
                if (options.data.style.circle && options.data.style.circle.radius) {
                    options_style.image = new ol.style.Circle({
                        radius: options.data.style.circle.radius,
                        fill: new ol.style.Fill(options.data.style.fill),
                        stroke: new ol.style.Stroke(options.data.style.stroke),
                   });
                } else if (options.data.style.icon && options.data.style.icon.src) {
                    options_style.image = new ol.style.Icon(({
                      anchor: [0.5, 0.5],
                      scale: options.data.style.icon.scale || 1,
                      anchorXUnits: 'fraction',
                      anchorYUnits: 'fraction',
                      src: options.data.style.icon.src
                    }))
                }
                
                var _style = new ol.style.Style(options_style);
                
                var options_style2 = {
                  fill: new ol.style.Fill(options.data.hightlightstyle.fill),
                  stroke: new ol.style.Stroke(options.data.hightlightstyle.stroke)                  
                };
                
                if (options.data.hightlightstyle.circle && options.data.hightlightstyle.circle.radius) {
                    options_style2.image = new ol.style.Circle({
                        radius: options.data.hightlightstyle.circle.radius,
                        fill: new ol.style.Fill(options.data.hightlightstyle.fill),
                        stroke: new ol.style.Stroke(options.data.hightlightstyle.stroke),
                   });
                } else if (options.data.hightlightstyle.icon && options.data.hightlightstyle.icon.src) {
                    options_style2.image = new ol.style.Icon(({
                      anchor: [0.5, 0.5],
                      scale: options.data.hightlightstyle.icon.scale || 1,
                      anchorXUnits: 'fraction',
                      anchorYUnits: 'fraction',
                      src: options.data.hightlightstyle.icon.src
                    }))
                }
                var _style2 = new ol.style.Style(options_style2);
                
               featureOverlay = new ol.layer.Vector({
                    source: new ol.source.Vector(),            
                    style: _style2
               });
               
               var _controls = ol.control.defaults();
               if (options.map.overview) {
                _controls.extend([
                      new ol.control.OverviewMap({className: 'ol-overviewmap ol-custom-overviewmap', 
                            collapseLabel: '\u00BB',
                            label: '\u00AB',
                            collapsed: false})
                    ]);
               }
              
              _map = new ol.Map({
                controls: _controls,
                layers: [
                  new ol.layer.Tile({
                    source: new ol.source.OSM({url: options.map.url})
                    //source: new ol.source.OSM({url: 'http://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'})
                  })
                ],
                target: 'map',
                view: new ol.View({
                  center: options.map.center,
                  zoom: options.map.zoom
                })
              });
              info = $('#feature-info');
              info.tooltip({
                animation: false,
                trigger: 'manual'
              });
              _map.on('pointermove', _mouseOverFeature);
              _map.on('singleclick', _clickFeature);
              
              $.getJSON( options.data.url, function( data ) {
                  var vectorSource = new ol.source.Vector({
                    features: (new ol.format.GeoJSON()).readFeatures(data)        
                  });
                  vectorLayer = new ol.layer.Vector({
                    source: vectorSource,
                    style: _style
                  });
                  _map.addLayer(vectorLayer);
                  _map.addLayer(featureOverlay);
                  
                    if (options.extradata.url) {
                        Papa.parse(_conf + options.extradata.url, {
                            download: true, 
                            header: true,
                            error: function(err) {
                                 var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                                _formatFeatures(reoderFeatures);
                            },
                            complete: function(results) {
                                console.log("Finished:", results.data);
                                 $.each(results.data, function (index, extra) {
                                    if (extra.id) {
                                        var feature = vectorSource.getFeatureById(extra.id);
                                        $.each(extra, function (prop, value) {
                                            if (prop !== 'id') {
                                                feature.set(prop, value);
                                            }
                                        });
                                   }
                                });
                                 var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                                _formatFeatures(reoderFeatures);
                            }
                       });
                   } else  {
                        var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                        _formatFeatures(reoderFeatures);
                   }
              });
        };
        
        var delta = document.documentURI.replace(document.baseURI,"");
        var sub = delta.substring(0,delta.search("/"));
        if (sub.length >1 ) {
            _conf = "stories/"+sub + "/";
        } else {
            _conf = "";
        }
        
        $.ajax({
            dataType: "json",
            url: _conf+ "config.json",            
            success: function (options) {
                console.log(options);
                _init(options);
            },
            error: function (xhr, ajaxOptions, thrownError) {
               console.log("error getting config file");
            }
        });
        
        var _orderFeatures = function (key) {
                return function(a,b){
                   if (a.get(key) > b.get(key)) return 1;
                   if (a.get(key) < b.get(key)) return -1;
                   return 0;
                }
        };
        
        var _formatFeatures  = function (features) {
            var items = [];
            var fake_lis = [];
            var carousel_lis = [];
            var counter = 0;
            var item_cls = "item-story";
            if (_options.data.presentation === "carousel") {
                item_cls = "item";
            }
            //var features = vectorSource.getFeatures();            
            for (i = 0; i < features.length; i++) {
                counter+=1;
                feature = features[i];
                feature.set("storyid", counter);
                var content = {title:"", text:[] , image : []};                
                for (j = 0; j < _options.data.fields.length; j++) {                    
                    switch( _options.data.fields[j].type) {
                        case "title":
                            content.title = '<h2>'+ feature.get(_options.data.fields[j].name) + '</h2>';
                            break;
                        case "text":
                            content.text.push('<p>' + (feature.get(_options.data.fields[j].name) || "") + '</p>');
                            break;
                        case "url":
                            content.text.push('<a title="Ouvrir dans une nouvelle fenêtre" href="'+(feature.get(_options.data.fields[j].name) || "")+'" target="_blank" >Lien</a>');
                            break;
                        case "image":
                            content.image.push('<img src="'+ (feature.get(_options.data.fields[j].name) || "") + '" class="img-responsive"></img>');
                            break;
                        default:
                            content.text.push('<p>' + (feature.get(_options.data.fields[j].name) || "") + '</p>');
                    }
                }
                
                //var position = [feature.get('x'), feature.get('y')].join(",");
                var position = ol.extent.getCenter(feature.getGeometry().getExtent()).join(",");
                items.push(['<div id="'+(counter)+'" class="'+item_cls+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" >',
                            content.title,
                            content.text.join(" "),
                            content.image.join(" "),
                            '</div>'].join(" "));
                var cls = (counter === 1)? 'active' : '';
                fake_lis.push('<li data-target="'+counter+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" class="'+cls+'" ><a href="#'+counter+'">'+content.title+'</a></li>');
                carousel_lis.push('<li data-target="#myCarousel" data-slide-to="'+(counter-1)+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" class="'+cls+'" ></li>');
            }
            items.push('<div id="end-lst" class="item-story">');
            if (_options.data.presentation === "list") {
                $("#fake-nav").append(fake_lis);
                $("#content-story").append(items);
                $("#panel-story").scrollspy({ target: '#myScrollspy', offset: 200 });
                
                $("#myScrollspy").on('activate.bs.scrollspy', function (e) {
                    _zoomTo (e.target.attributes["data-position"].value.split(",").map(Number) ,
                            e.target.attributes["data-target"].value, 
                            e.target.attributes["data-featureid"].value);
                });
                var el = $("[data-target='1']");
                _zoomTo(el.attr("data-position").split(",").map(Number), el.attr("data-target"), el.attr("data-featureid"));
                if (document.location.hash) {
                    var el = document.location.hash.replace("#","");
                    $(document).ready(function() {
                      document.getElementById(el).scrollIntoView({ 
                        behavior: "auto", // or "auto" or "instant or smooth"
                        block: "end" // or "end"
                      });
                      
                    });
                    //document.getElementById(el).scrollIntoView({ behavior: "smooth" });
                }
            } else if (_options.data.presentation === "carousel") {                
                $(".carousel-indicators").append(carousel_lis);
                $(".carousel-inner").append(items);
                $(".carousel-inner .item").first().addClass("active");
                $(".carousel").carousel();
                $(".carousel").on('slide.bs.carousel', function (e) {
                    var direction = (e.direction === "right")?-1:+1;
                    var actual_slide = parseInt($(".nextButton a").attr("data-actual-slide"));
                    console.log(actual_slide, e.direction, e.relatedTarget.attributes["id"].value,  actual_slide+direction);
                    _zoomTo (e.relatedTarget.attributes["data-position"].value.split(",").map(Number) ,
                            e.relatedTarget.attributes["id"].value, 
                            e.relatedTarget.attributes["data-featureid"].value);
                    _setProgress( (parseInt(e.relatedTarget.attributes["id"].value) )  / $(".item").length * 100);
                    
                    
                    $(".carButton a").attr("data-actual-slide", actual_slide+direction);
                    
                });
                var el = $("[data-slide-to='0']");
                _zoomTo(el.attr("data-position").split(",").map(Number), el.attr("id"), el.attr("data-featureid"));
                _setProgress( parseInt(1 / $(".item").length * 100));                
            }
            
             if (_options.data.presentation === "list") {
               document.addEventListener("ks_click", function (e) {
                     document.getElementById(feature.get("storyid")).scrollIntoView({
                        behavior: "smooth", // or "auto" or "instant"                
                    });
                });     
            } else if (_options.data.presentation === "carousel") {
                document.addEventListener("ks_click", function (e) {
                     $('.carousel').carousel(e.detail.storyid -1);
                });
            }         
      };
       
      
      var _mouseOverFeature = function (evt) {
        if (evt.dragging) {
          return;
        }
        featureOverlay.getSource().clear();
        var pixel = _map.getEventPixel(evt.originalEvent);
        info.css({
          left: pixel[0] + 'px',
          top: (pixel[1] - 15) + 'px'
        });
        var feature = _map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {
            /*document.getElementById("map").style.cursor = 'pointer';
            document.getElementById('feature-info').innerHTML = feature.get('nom'); */
            info.tooltip('hide')
              .attr('data-original-title', feature.get('nom'))
              .tooltip('fixTitle')
              .tooltip('show');
            featureOverlay.getSource().addFeature(feature);
        } else {
             info.tooltip('hide');
            document.getElementById("map").style.cursor = '';
        }
    };
    
    var _clickFeature = function (evt) {
        var pixel = _map.getEventPixel(evt.originalEvent);
        var feature = _map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {        
            var event = new CustomEvent('ks_click', { 'detail': feature.getProperties() });    
            document.dispatchEvent(event);
            /*document.getElementById(feature.get("storyid")).scrollIntoView({
                behavior: "smooth", // or "auto" or "instant"                
            });
            $('.carousel').carousel(feature.get("storyid"));*/
        } 
    };
    
    var _setProgress = function (value) {
        $('.progress-bar').css('width', value+'%').attr('aria-valuenow', value);
    };

    var _zoomTo = function (coordinates, item, featureid) {
        var viewOffset = 0;
        if (_options.data.presentation === "list") {
            $("#content-story .item-story.active").removeClass("active");
            $('#'+item).addClass("active");
        } else {
            viewOffset = $(window).width() / 2;
        }
        var mapPosition = coordinates;        
        // zoom animation
        if (_options.map.animation) {
            var duration = 2000;
            var start = +new Date();
            var pan = ol.animation.pan({
              duration: duration,
              source: /** @type {ol.Coordinate} */ (_map.getView().getCenter()),
              start: start
            });
            var bounce = ol.animation.bounce({
              duration: duration,
              resolution: 4 * _map.getView().getResolution(),
              start: start
            });
            _map.beforeRender(pan, bounce);
       }
       var feat = vectorLayer.getSource().getFeatureById(featureid);
       featureOverlay.getSource().clear();
       featureOverlay.getSource().addFeature(feat);
       //_map.getView().setCenter(mapPosition);
       _map.getView().fit(vectorLayer.getSource().getFeatureById(featureid).getGeometry(), _map.getSize(), {padding: [0,viewOffset,0,0], nearest: true, maxZoom: _options.map.zoom});
       //window.location.hash = "#"+ item;
    };    