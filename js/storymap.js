var _map, featureOverlay, _options, _conf, vectorLayer;
        var _init = function  (options) {
              _options = options;
              $("#content-title h1").text(options.data.title);
              $("#map").css("width",options.map.width);
              $("#panel-story").css("width", 100 - parseInt(options.map.width) + '%');
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
                 
                  /*$.ajax({
                        dataType: "json",
                        url: options.extradata.url,            
                        success: function (extradata) {                            
                            $.each(extradata, function (index, extra) {
                                var feature = vectorSource.getFeatureById(extra.id);
                                $.each(extra, function (prop, value) {
                                    if (prop !== 'id') {
                                        feature.set(prop, value);
                                    }
                                });
                            });
                             var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                            _formatFeatures(reoderFeatures);
                        },
                        error: function (xhr, ajaxOptions, thrownError) {
                            var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                            _formatFeatures(reoderFeatures);
                        }
                    });*/
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
            var counter = 0;
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
                items.push(['<div id="'+counter+'" class="item-story">',
                            content.title,
                            content.text.join(" "),
                            content.image.join(" "),
                            '</div>'].join(" "));
                var cls = (counter === 1)? 'active' : '';
                fake_lis.push('<li data-target="'+counter+'" data-featureid="'+feature.getId()+'" data-position="'+position+'" class="'+cls+'" ><a href="#'+counter+'">'+content.title+'</a></li>');
            }
            items.push('<div id="end-lst" class="item-story">');
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
      };
       
      
      var _mouseOverFeature = function (evt) {
        if (evt.dragging) {
          return;
        }
        featureOverlay.getSource().clear();
        var pixel = _map.getEventPixel(evt.originalEvent);
        var feature = _map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {
            document.getElementById("map").style.cursor = 'pointer';
            document.getElementById('feature-info').innerHTML = feature.get('nom'); 
            featureOverlay.getSource().addFeature(feature);
        } else {
            document.getElementById("map").style.cursor = '';
        }
    };
    
    var _clickFeature = function (evt) {
        var pixel = _map.getEventPixel(evt.originalEvent);
        var feature = _map.forEachFeatureAtPixel(pixel, function(feature) {
          return feature;
        });
        if (feature) {        
            var event = new CustomEvent('rn_click', { 'detail': feature.getProperties()["nom"] });    
            document.dispatchEvent(event);
            document.getElementById(feature.get("storyid")).scrollIntoView({
                behavior: "smooth", // or "auto" or "instant"                
            });
        } 
    };
    
    
    
      
     
             
    document.addEventListener("rn_click", function (e) {
        //alert(e.detail);
    });

    var _zoomTo = function (coordinates, item, featureid) {
        $("#content-story .item-story.active").removeClass("active");
        $('#'+item).addClass("active");
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
       _map.getView().setCenter(mapPosition);
       //window.location.hash = "#"+ item;
    };
    
    
    
    /*$("#myScrollspy").on('activate.bs.scrollspy', function (e) {
        _zoomTo (e.target.attributes["data-position"].value.split(",").map(Number) ,
                e.target.attributes["data-target"].value, 
                e.target.attributes["data-featureid"].value);
    });*/