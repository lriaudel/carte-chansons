/* ##############
création des variables
################# */
var map = L.map('mapid').setView([39, -36], 3);
map.on('zoomend', function() {
    drawMarkers();
    console.log(map.getZoom())
});
//console.log(map.getZoom())
var villeLayer = L.layerGroup();
var circLayer = L.layerGroup();



/* ##############
création des couches 
################# */
//https://api.mapbox.com/styles/v1/mickaelmarchese/ckgxf0bka4a8c19pg8dms30y7.html?fresh=true&title=copy&access_token=pk.eyJ1IjoibWlja2FlbG1hcmNoZXNlIiwiYSI6ImNrMnl6ZWRtbDBhbzYzaXA4ZTk1YmI0Y3AifQ.qppfRuFTjKL-kUQdiwV9vA
//https://api.mapbox.com/styles/v1/mickaelmarchese/ckghz0iwk09n819ok6wqaf1r5.html?fresh=true&title=copy&access_token=pk.eyJ1IjoibWlja2FlbG1hcmNoZXNlIiwiYSI6ImNrMnl6ZWRtbDBhbzYzaXA4ZTk1YmI0Y3AifQ.qppfRuFTjKL-kUQdiwV9vA
//https://api.mapbox.com/styles/v1/mickaelmarchese/ckgtfq0dm1i2p1an2k5u4pdel.html?fresh=true&title=copy&access_token=pk.eyJ1IjoibWlja2FlbG1hcmNoZXNlIiwiYSI6ImNrMnl6ZWRtbDBhbzYzaXA4ZTk1YmI0Y3AifQ.qppfRuFTjKL-kUQdiwV9vA
L.tileLayer('https://api.mapbox.com/styles/v1/mickaelmarchese/ckgtfq0dm1i2p1an2k5u4pdel/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWlja2FlbG1hcmNoZXNlIiwiYSI6ImNrMnl6ZWRtbDBhbzYzaXA4ZTk1YmI0Y3AifQ.qppfRuFTjKL-kUQdiwV9vA', {
    maxZoom: 10,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery &copy; <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);

/* ##############
ajout des villes sur le layer
################# */
villes = {}
sortedVilles=[]
d3.csv("resVillesChansons.csv", function(data){
    uneVille=data.Ville.split(',')[0]
    if(uneVille in villes){
        villes[uneVille]['nb'] += 1;
        nouvelleville['chansons'].push({artiste:data.Artiste,titre:data.Chanson})
        spotify= data.spotify == '' ?  '' : '<a href="'+data.spotify+'"  target="_new"><img src="img/spotify.svg" alt="Ecouter sur Spotify" title="Ecouter sur Spotify"></a>'
        nouvelleville['label'] += '<div id="songlist"><span class="songtitle">'+data.Chanson+'</span> '+data.Artiste+spotify+'</div>'
    }
    else{
        nouvelleville={};
        nouvelleville['nb']=1;
        nouvelleville['lat']=data.lat;
        nouvelleville['lng']=data.lng;
        nouvelleville['ville']=uneVille;
        nouvelleville['adr']=data.complete_address;
        nouvelleville['chansons']=[];
        nouvelleville['chansons'].push({artiste:data.Artiste,titre:data.Chanson});
        spotify= data.spotify == '' ?  '' : '<a href="'+data.spotify+'"  target="_new"><img src="img/spotify.svg" alt="Ecouter sur Spotify" title="Ecouter sur Spotify"></a>'
        nouvelleville['label']= '<div class="ville">'+uneVille+'</div><div id="songlist"><span class="songtitle"> '+data.Chanson+'</span>'+data.Artiste+spotify+'</div>';
        villes[uneVille]=nouvelleville;
    }
 }).then( function(){
     //trier les villes selon NB pour afficher les plus importantes en premier
     jQuery.each(villes, function(i, val) {
        sortedVilles.push(val);
        sortedVilles = sortedVilles.slice().sort((a, b) => d3.descending(a.nb, b.nb));
     });
     drawMarkers();
 })


/* ##############
ajout des layers sur la map
################# */
villeLayer.addTo(map);

/* ##############
fonctions perso
################# */

function addCurvedText(c,t,s,coul){
    px= s<24 ? 12 : s/2;
    pt= px*0.75
    var id = L.Util.stamp(c);
    svg=c._map._renderer._container;
    c._path.setAttribute('id', id);
    var textNode = L.SVG.create('text'),
        textPath = L.SVG.create('textPath');
    textPath.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", '#'+id);
    textNode.setAttribute('dy', px/1.5);
    //textNode.setAttribute('dx', 100);
    textNode.setAttribute('font-size', pt);
    textNode.setAttribute('font-family','DM Serif Display');
    textNode.setAttribute('fill',coul);
    textPath.appendChild(document.createTextNode(t));
    textNode.appendChild(textPath);
    c._textNode = textNode;
    svg.appendChild(textNode);
}
function checkdistance(p1,p2){
    dist = map.latLngToLayerPoint(p1).distanceTo(map.latLngToLayerPoint(p2));
    return(dist)
}
function drawMarkers(){
    villeLayer.clearLayers();
    jQuery.each(sortedVilles, function(i, val) {
        radius= 10+ val.nb*2
        //vérifier la distance avec tous les autres markers existant
        coor=L.latLng(val.lat,val.lng);
        tooClose=false;
        villeLayer.eachLayer(function (marker) { 
            if(!tooClose){
            distance = checkdistance(marker.getLatLng(),coor)
            if(distance < marker.getRadius()+(radius*1.1))
                tooClose = true;
            }
        });
        couleur=val.adr.indexOf("France")>0 ? '#F086A3':'#F0AF84'
        circ=L.circleMarker([val.lat,val.lng],{radius: radius,color: couleur ,opacity:1}).addTo(villeLayer);
        circ.on('mouseover', function (e) {
            $('#description').html(val.label)
            $('#description').css('visibility','visible')
        });
        if(!tooClose)
            addCurvedText(circ,val.ville,radius,couleur)
      });
}

function collapse(){
        $( "#mainTitle" ).animate({
          left: "60px",
          height: "110px",
          "margin-left": "0"          
        }, 500, function() {
          $( "#mainTitle" ).css("overflow","hidden")
        });
}

