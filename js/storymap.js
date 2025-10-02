var templates = templates || {};
templates.default = function(dom, div, options) {
    this.formatFeatures = function(features, fields) {
        document.addEventListener("ks_click", function(e) {
            /*console.log(e.detail);*/
        });
    };
};
//Fix IE CustomEvent
(function () {
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
})();
ks = (function() {
    /*
     * Private
     */
    var _map, featureOverlay, featureSelected, _options, _conf, vectorLayer, info, _template;
    
    var _projection = ol.proj.get('EPSG:3857');
    var projectionExtent = _projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256; 
    var _WMTSTileMatrix = {'EPSG:3857': [], 'EPSG:4326': [],'EPSG:2154': [],'PM':[]};
    var _WMTSTileResolutions = {'EPSG:3857': [], 'EPSG:4326': [],'EPSG:2154': [],'PM':[]};
    for (var z = 0; z < 22; ++z) {
            // generate resolutions and matrixIds arrays for this GEOSERVER WMTS
            _WMTSTileResolutions['EPSG:3857'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:3857'][z] = 'EPSG:3857:' + z;
            _WMTSTileResolutions['EPSG:4326'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:4326'][z] = 'EPSG:4326:' + z;
            _WMTSTileResolutions['EPSG:2154'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['EPSG:2154'][z] = 'EPSG:2154:' + z;
    }
     for (var z = 0; z < 20; ++z) {
            // generate resolutions and matrixIds arrays for this GEOPORTAIL WMTS
            _WMTSTileResolutions['PM'][z] = size / Math.pow(2, z);
            _WMTSTileMatrix['PM'][z] = z;
    }        
    

    var _createStyle = function(options) {
        var options_style = {
            fill: new ol.style.Fill(options.fill),
            stroke: new ol.style.Stroke(options.stroke)
        };

        if (options.circle && options.circle.radius) {
            options_style.image = new ol.style.Circle({
                radius: options.circle.radius,
                fill: new ol.style.Fill(options.fill),
                stroke: new ol.style.Stroke(options.stroke)
            });
        } else if (options.icon && options.icon.src) {
            options_style.image = new ol.style.Icon(({
                anchor: [0.5, 0.5],
                scale: options.icon.scale || 1,
                anchorXUnits: 'fraction',
                anchorYUnits: 'fraction',
                src: options.icon.src
            }))
        }
        return new ol.style.Style(options_style);
    };

    var _createTooltipContent = function(feature, fields, template) {
        var info = "";
        var content = [];
        if (template) {
            info = Mustache.render(template, feature.getProperties())
        } else {
            if (fields.length === 0) {
                content.push(feature.get(_options.data.fields.filter(function(o) {
                    return o.type === 'title';
                })[0].name));
            } else {
                for (var i = 0; i < fields.length; i++) {                
                    var text = feature.get(fields[i]);
                    if ((i === 0) && fields.length > 1) {
                        text = "<h5>" + text + "</h5>";
                    }
                    content.push(text);
                }
            }
            info = content.join("</br>");
        }
        return info;
    };
    
    var _receiveMessage = function (event)
    {
      if (event.origin !== window.location.origin) {
        return;
      } else {
        if (event.data === 'splash-next');
            $('#splash').fadeOut();
            $('#content-title').show();
      }

    };

    var _init = function(options) {
        _options = options;
        if (options.menu && options.menu.creditenabled === "true") {     
            var creditbtn = `<button role="button" id="btn-infos" href="#" onclick="ks.menuaction('infos');" title="Crédits" class="btn btn-light"><i class="bi bi-info-circle"></i></button>`; 
            $("#menu").append(creditbtn);
            if (options.menu.credit) { 
                $("#panelInfos_content").html(options.menu.credit);
            }
        } 
        if (options.menu && options.menu.shareenabled === "true") {     
            var sharebtn = `<button role="button" id="btn-share" href="#" onclick="ks.menuaction('share');" title="Partager" class="btn btn-light"><i class="bi bi-share"></i></button>`; 
            $("#menu").append(sharebtn);
        }
        //Url to panel share
        const currentUrlApp = window.location.href;
        $("#urlShare__link").val(currentUrlApp);
        let urlEmail = `mailto:?&body=` + encodeURIComponent(currentUrlApp);
        let urlFacebook = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(currentUrlApp);
		let urlX = "https://twitter.com/intent/post?url=" + encodeURIComponent(currentUrlApp);
		let urlWhatapp = "https://wa.me/?text=" + encodeURIComponent(currentUrlApp);
        const btnEmail = document.getElementById('btnShareEmail');
        const btnFacebook = document.getElementById('btnShareFacebook');
		const btnX = document.getElementById('btnShareX');
		const btnWhatapp = document.getElementById('btnShareWhatapp');
        btnFacebook.setAttribute("href", urlFacebook);
		btnX.setAttribute("href", urlX);
		btnWhatapp.setAttribute("href", urlWhatapp);
        btnEmail.setAttribute("href", urlEmail);
        let urlIframe = `<iframe width="800" height="500" style="border:none;" src="${currentUrlApp}"></iframe>`;
        document.getElementById("block__IframeUrl").innerText = urlIframe;
        //splash config
        if (options.splash && !options.splash.iframe) {            
            $("#splash").prepend('<div class="container p-5"><h1>'+ options.splash.title +'</h1><h5>'+ options.splash.text +'</h5>');
            $("#splash").show();
            $("#btn-home").toggleClass("no-visible");
        } else if (options.splash && options.splash.iframe) {
            $("#splash .story-btn-next").remove();
            $("#splash").prepend('<iframe src="'+options.splash.iframe+'" style="height:100%;border:none;width:100%;" scrolling="no"></iframe>');
            $("#splash").css('background-color','#ffffff');
            $("#splash").show();
            $("#btn-home").toggleClass("no-visible");
        } else {
            $("#content-title").show();
        }
        window.addEventListener("message", _receiveMessage, false);
        $('#myModal').on('show.bs.modal', function (event) {
              var button = $(event.relatedTarget); // Button that triggered the modal
              var title = button.data('modal-title');
              var body = button.data('modal-body'); 
              var modal = $(this);
              modal.find('.modal-title').text(title);
              modal.find('.modal-body').text(body);
        });
        
        //Theme color or css
        if (options.theme && options.theme.css) {
            var cssfile = [_conf, options.theme.css].join("");
            $('head').append('<link rel="stylesheet" href="'+cssfile+'" type="text/css" />');
        } 
        //Add style variables
        var styleNode = document.createElement('style');
        document.getElementsByTagName('head')[0].appendChild(styleNode);
        if(options.theme && options.theme.color){
            var styleColorStorie = document.createTextNode(':root {--colorStorie :'+ options.theme.color +';}');
            styleNode.appendChild(styleColorStorie);
        }   
        // Panel size     
        if(options.data.template && options.data.template.size){
            var stylePanelSize = document.createTextNode(':root {--panelStorieSize :'+ options.data.template.size +';}');
            styleNode.appendChild(stylePanelSize);
        }
        //Map title
        $("#content-title h1").text(options.data.title);
        $("#content-title h3").text(options.data.subtitle); 
        if(options.data.title){
            document.title = options.data.title;
        }

        // templates config
        _template = new templates[options.data.template.name](document, $("#template"));
        // Config map features styles              
        var analyse = _options.data.analyse;
        var _style;
        if ((analyse.type === "categories") && analyse.field && analyse.values.length > 0) {
            //Create analyse
            var rules = {};
            for (var i = 0; i < analyse.values.length; i++) {
                var options_style = analyse.styles[i];
                rules[analyse.values[i]] = _createStyle(options_style);
            }
            _style = function(feature, resolution) {
                return [rules[feature.get(analyse.field)]];
            };

        } else if (analyse.type === "single") {
            // All features are displayed with the same style
            var options_style = analyse.styles[0];
            _style = _createStyle(options_style);
        }

        var _highlight = _createStyle(options.data.hightlightstyle);
        featureOverlay = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: _highlight
        });        
        featureSelected = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: _highlight
        });

        //Config map
        var _backgroundlayer;
        if (options.backgroundlayer && options.backgroundlayer.type && options.backgroundlayer.url) {            
            switch (options.backgroundlayer.type) {
                case "WMS":
                    _backgroundlayer =  new ol.layer.Tile({
                        source: new ol.source.TileWMS({
                            url: options.backgroundlayer.url,                                                      
                            params: {
                                'LAYERS': options.backgroundlayer.layer,
                                'VERSION': '1.1.1',
                                'FORMAT': options.backgroundlayer.format,                                
                                'TILED': true
                            }
                        })
                      });
                      break;
                      
                case "WMTS":
                    _backgroundlayer = new ol.layer.Tile({
                          source: new ol.source.WMTS({
                            url: options.backgroundlayer.url,                            
                            layer: options.backgroundlayer.layer,
                            matrixSet: options.backgroundlayer.tilematrixset,
                            style: options.backgroundlayer.style,
                            format: options.backgroundlayer.format,
                            projection: _projection,
                            tileGrid: new ol.tilegrid.WMTS({
                              origin: ol.extent.getTopLeft(projectionExtent),
                              resolutions: _WMTSTileResolutions[options.backgroundlayer.tilematrixset],
                              matrixIds: _WMTSTileMatrix[options.backgroundlayer.tilematrixset]
                            })
                          })
                   });              
            
            }
        
        } else {
            _backgroundlayer = new ol.layer.Tile({
                    source: new ol.source.OSM({
                        url: options.map.url
                    })
                });
        }
        _map = new ol.Map({
            controls: [],
            layers: [_backgroundlayer],
            target: 'map',
            view: new ol.View({
                center: options.map.center,
                zoom: options.map.initial_zoom || options.map.zoom
            })
        });
        
        //Config map controls
       var _overviewMapControl;
       if (options.map.overview) {
            _overviewMapControl = new ol.control.OverviewMap({
                // see in overviewmap-custom.html to see the custom CSS used
                className: 'ol-overviewmap ol-custom-overviewmap',
                layers: [
                    new ol.layer.Tile({
                      source: new ol.source.OSM({
                        url:options.map.url
                      }),
                    }),
                  ],
                collapseLabel: '\u00BB',
                label: '\u00AB',
                collapsed: false,
              });
            
            _map.addControl(_overviewMapControl);
        }
        //Configure map features tooltips        
        info = $('#feature-info');
        info.tooltip({
            animation: false,
            trigger: 'manual',
            html: true,
            template: '<div class="tooltip tooltip-custom" role="tooltip"><div class="tooltip-custom tooltip-arrow"></div><div class="tooltip-custom tooltip-inner"></div></div>'
        });
        //Register map events
        _map.on('pointermove', _mouseOverFeature);
        _map.on('singleclick', _clickFeature);
        $("#panel-story").hover(function() {
            featureOverlay.getSource().clear();
            info.tooltip('hide');
            document.getElementById("map").style.cursor = '';
        });
        // get Features + add optional extra data annd add this features to the map
        $.getJSON(options.data.url, function(data) {
            var vectorSource = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(data)
            });
            // if id is not set in geojson, set id for each feature with the options.data.id present in the config file
            if (options.data.id) {
                vectorSource.getFeatures().forEach(function(feature){
                    feature.setId(feature.getProperties()[options.data.id]);
                });
            }
            vectorLayer = new ol.layer.Vector({
                source: vectorSource,
                style: _style
            });
            _map.addLayer(vectorLayer);
            _map.addLayer(featureOverlay);
            _map.addLayer(featureSelected);
            // Get Extra data to join to existing features
            if (options.extradata.url) {
                Papa.parse(_conf + options.extradata.url, {
                    download: true,
                    header: true,
                    error: function(err) {
                        var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));                        
                        _template.formatFeatures(reoderFeatures.filter(_removeFakeFeatures), _options.data);
                    },
                    complete: function(results) {                        
                        $.each(results.data, function(index, extra) {
                            /*console.log(_options);*/
                            if (extra[_options.extradata.linkfield || 'featureid']) {
                                var feature = vectorSource.getFeatureById(extra[_options.extradata.linkfield || 'featureid']);
                                if (feature) {
                                    $.each(extra, function(prop, value) {
                                        if (prop !== extra[_options.extradata.linkfield || 'featureid']) {
                                            feature.set(prop, value);
                                        }
                                    });
                                }
                            }
                        });
                        var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                        /*reoderFeatures.forEach(function (item, id) {
                            console.log(id, item.get(_options.data.orderby));
                        });*/
                        _template.formatFeatures(reoderFeatures.filter(_removeFakeFeatures), _options.data);                        
                    }
                });
            } else {
                var reoderFeatures = vectorSource.getFeatures().sort(_orderFeatures(_options.data.orderby));
                _template.formatFeatures(reoderFeatures.filter(_removeFakeFeatures), _options.data);                
            }           
        });        
    };
    // Detect subfolder path. if subfolder is detected in url eg map1 in http://thisapp/map1/ ,application will be use the directory thisapp/stories/map1/ to get config.json.
    //If no subfolder detected, the config.json in thisapp directory will be used.
    var sub;
    if (document.documentURI) {
        var delta = document.documentURI.replace(document.baseURI, "");
        sub = delta.substring(0, delta.search("/"));
    } else {
        sub = window.location.href.split("/").reverse()[1];
    }
    if (sub.length > 1) {
        _conf = "stories/" + sub + "/";
    } else {
        _conf = "";
    }
    // Get config file
    $.ajax({
        dataType: "json",
        url: _conf + "config.json",
        success: function(options) {
            /*console.log(options);*/
            _init(options);
        },
        error: function(xhr, ajaxOptions, thrownError) {
            console.log("error getting config file");
        }
    });
    
    var _removeFakeFeatures = function (feature) {
        return feature.getId() !== "fake";
    }

    var _orderFeatures = function(key) {
        return function(a, b) {
            var ret = 0;
            if (parseInt(a.get(key) || 100) > parseInt(b.get(key))) {ret = 1;}
            if (parseInt(a.get(key)) < parseInt(b.get(key))) {ret = -1;}            
            return ret;
        }
    };


    var _mouseOverFeature = function(evt) {
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
            info.tooltip('hide')
                .attr('data-original-title', _createTooltipContent(feature, _options.tooltip.fields || [], _options.tooltip.template))
                .attr('title', _createTooltipContent(feature, _options.tooltip.fields || [], _options.tooltip.template))
                .attr('aria-label', _createTooltipContent(feature, _options.tooltip.fields || [], _options.tooltip.template))
                .attr('data-bs-original-title', _createTooltipContent(feature, _options.tooltip.fields || [], _options.tooltip.template))
                .tooltip({title:'fixTitle'})
                .tooltip('show');
            featureOverlay.getSource().addFeature(feature);
        } else {
            info.tooltip('hide');
            document.getElementById("map").style.cursor = '';
        }
    };

    var _clickFeature = function(evt) {
        var pixel = _map.getEventPixel(evt.originalEvent);
        var feature = _map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });
        if (feature) {
            var event = new CustomEvent('ks_click', {
                'detail': feature.getProperties()
            });
            document.dispatchEvent(event);
        }
    };

    var _zoomTo = function(coordinates, item, featureid, offset,first_animation=false) {
        var mapPosition = coordinates;
        info.tooltip('hide');
        featureOverlay.getSource().clear();
        var feat = vectorLayer.getSource().getFeatureById(featureid);        
        featureSelected.getSource().clear();
        featureSelected.getSource().addFeature(feat);
        // zoom animation
        var duration = null;
        if (_options.map.animation) {
            var resolution =  _map.getView().getResolutionForExtent(feat.getGeometry().getExtent());

            // for first animation, zoom to 'initial_zoom' not 'zoom', and center view on 'initial_view_center'
            if (first_animation) {
                var zoom_to_use = _options.map.initial_zoom || _options.map.zoom;
                var center_to_use =  _options.map.initial_view_center || ol.extent.getCenter(feat.getGeometry().getExtent());
            }
            else{
                var zoom_to_use = _options.map.zoom;
                var center_to_use = ol.extent.getCenter(feat.getGeometry().getExtent());
            }
            
            if (resolution > 0) {
                var zoom_to_use =  _map.getView().getZoomForResolution(resolution);
            } 
            
            var duration = _options.map.animation_duration_ms || 2000;
            _map.getView().animate({
            center: center_to_use,
            duration: duration
            });
            
            

            // dont execute the second part of the animation if its the first animation and the initial_view_center is the same as the center
            if (first_animation) {
                // if center is the same as the initial_view_center, no need to animate the zoom
                if (center_to_use[0] != mapPosition[0] || center_to_use[1] != mapPosition[1]) {
                    _map.getView().animate({
                        zoom: zoom_to_use,
                        duration: duration
                    });
                }
            } else { // animation from point to point
                _map.getView().animate({
                    zoom: zoom_to_use - 1,
                    duration: duration / 2
                    }, {
                    zoom: zoom_to_use,
                    duration: duration / 2
                    });
            }
        
        } else {
            _map.getView().fit(feat.getGeometry(), { size: _map.getSize(), padding: [0, 0, 0, 0], nearest: false, maxZoom: _options.map.zoom});
        }
    };



    return {
        /*
         * Public
         */

        version: "0.1",

        zoomTo: function(coordinates, item, featureid, offset,first_animation=false) {
            _zoomTo(coordinates, item, featureid, offset,first_animation);
        },
        
        menuaction: function (action) {
            event.preventDefault();            
            switch (action) {
                case 'home':
                    $("#splash").show();
                    break;
                case 'zoomplus':
                    _map.getView().animate({zoom: _map.getView().getZoom() + 1});
                    break;
                case 'zoommoins':
                    _map.getView().animate({zoom: _map.getView().getZoom() - 1});
                    break;
                case 'extent':
                    var extent = vectorLayer.getSource().getExtent();
                    var offset = $("#panel-story").width();
                    _map.getView().fit(extent, _map.getSize(), {
                        padding: [0, offset, 0, 0]                        
                    });
                    break;
                case 'infos':
                    $("#panel-infos").modal('show');
                    break;
                case 'share':
                    $("#panel-share").modal('show');
                    break;
            }
        },
        popupPhoto: function (src, title, sources) {
            $("#imagepopup").find("img").attr("src",src) ;
            if (title) {
                 $("#imagepopup .modal-title").text(title);
            } else {
                $("#imagepopup .modal-title").text("");
            }
            if (sources) {
                $("#imagepopup figcaption").text(sources);
            } else {
                $("#imagepopup figcaption").text("");
            }
            $("#imagepopup").modal('show');
        },

        popupIframe: function (src) {
            $("#iframepopup").find("iframe").attr("src",src) ;            
            $("#iframepopup").modal('show');
        },
        
        refreshMap: function () {
            _map.updateSize();
        },
        
        audio: function (item) {
            //Stop all sounds
            $("audio").each(function(id, audio) {audio.pause();});
            //Play current sound if exists
            $(item).find("audio").first().each(function(id, audio) {audio.play();});
            
        }
    };

}());