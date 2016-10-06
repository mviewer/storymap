var _map, featureOverlay, _options, _conf;
        var _init = function  (options) {
              _options = options;              
              $("#map").css("width",options.map.width);
              $("#panel-story").css("width", 100 - parseInt(options.map.width) + '%');
              var _style = new ol.style.Style({
                  fill: new ol.style.Fill(options.data.style.fill),
                  stroke: new ol.style.Stroke(options.data.style.stroke)
                });
                
                var _style2 = new ol.style.Style({
                  fill: new ol.style.Fill(options.data.hightlightstyle.fill),
                  stroke: new ol.style.Stroke(options.data.hightlightstyle.stroke)
                });
                
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
                  var vectorLayer = new ol.layer.Vector({
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
                        Papa.parse("stories/"+_conf+"/"+ options.extradata.url, {
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
        var b = document.documentURI.replace(document.baseURI,"");
        _conf = b.substring(0,b.search("/"));
        $.ajax({
            dataType: "json",
            url: "stories/"+_conf+"/config.json",            
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
                feature = features[i];
                feature.set("storyid", counter);
                var content = {title:"", text:[] , image : []};
                counter+=1;
                for (j = 0; j < _options.data.fields.length; j++) {                    
                    switch( _options.data.fields[j].type) {
                        case "title":
                            content.title = '<h2>'+ feature.get(_options.data.fields[j].name) + '</h2>';
                            break;
                        case "text":
                            content.text.push('<p>' + (feature.get(_options.data.fields[j].name) || "") + '</p>');
                            break;
                        case "image":
                            content.image.push('<img src="'+ (feature.get(_options.data.fields[j].name) || "") + '" class="img-responsive"></img>');
                            break;
                        default:
                            content.text.push('<p>' + (feature.get(_options.data.fields[j].name) || "") + '</p>');
                    }
                }
                
                var position = [feature.get('x'), feature.get('y')].join(",");        
                items.push(['<div id="'+counter+'" class="item-story">',
                            content.title,
                            content.text.join(" "),
                            content.image.join(" "),
                            '</div>'].join(" "));
                var cls = (counter === 1)? 'active' : '';
                fake_lis.push('<li data-target="'+counter+'" data-position="'+position+'" class="'+cls+'" ><a href="#'+counter+'">'+content.title+'</a></li>');
            }
            items.push('<div id="end-lst" class="item-story">');
            $("#fake-nav").append(fake_lis);
            $("#content-story").append(items);
            $("#panel-story").scrollspy({ target: '#myScrollspy', offset: 200 });
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
    
    $("#myScrollspy").on('activate.bs.scrollspy', function (e) {
        $("#content-story .item-story.active").removeClass("active")
        $('#'+e.target.attributes["data-target"].value).addClass("active");
        var coordinates = e.target.attributes["data-position"].value.split(",").map(Number);
        var mapPosition = ol.proj.transform(coordinates, 'EPSG:4326', 'EPSG:3857');
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
       _map.getView().setCenter(mapPosition);
    });