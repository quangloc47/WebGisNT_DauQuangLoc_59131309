# WebGisNT_DauQuangLoc_59131309
WEBGIS PHỤC VỤ TÌM KIẾM THÔNG TIN NHÀ TRỌ THÀNH PHỐ NHA TRANG

SELECT DISTINCT ON (s.matr) s.matr, s.tentr, s.geom, h.sonha
	FROM public.truong s
		LEFT JOIN public.nhatro h ON ST_DWithin(s.geom::geography, h.geom::geography, 400)
	ORDER BY s.matr, ST_Distance(s.geom, h.geom);


SELECT s.matr, s.tentr, s.geom, h.sonha
	FROM public.truong s
		LEFT JOIN public.nhatro h ON ST_DWithin(s.geom::geography, h.geom::geography, 400)
	ORDER BY s.matr, ST_Distance(s.geom, h.geom);


SELECT tr.mant, tr.sonha, tr.maphuongxa , tr.geom, ti.sonha, ti.maphuongxa, ti.tentienich
FROM public.nhatro tr
LEFT JOIN public.tienich ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, 400)
WHERE tr.maphuongxa = 'PX020' AND ti.maloaiti = 'HST';

SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as styleress, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro, ti.tentr,
        ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat
FROM public.nhatro tr
            LEFT JOIN public.truong ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, 400)
            INNER JOIN public.user us ON tr.id = us.id
            INNER JOIN public.duong d ON tr.maduong = d.maduong
            INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
            INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
            INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
WHERE tr.maphuongxa = 'PX023';

TÌM KIẾM XUNG QUANH
SELECT *  
FROM public.nhatro 
WHERE ST_DWithin(geom, ST_MakePoint(109.202364, 12.268127)::geography, 300);
SELECT ST_Buffer(  
    ST_MakePoint(109.202364, 12.268127)::geography, 
    300)::geometry;

http://localhost:8080/geoserver/NhaTroNT/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=NhaTroNT%3Anhatro&STYLES=&LAYERS=NhaTroNT%3Anhatro&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application%2Fjson&X=50&Y=50&SRS=EPSG%3A4326&WIDTH=101&HEIGHT=101&BBOX=109.1984844954917%2C12.264361009778042%2C109.20065172037573%2C12.266528234662076

http://localhost:8080/geoserver/NhaTroNT/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&FORMAT=image%2Fpng&TRANSPARENT=true&QUERY_LAYERS=NhaTroNT%3Anhatro&STYLES=&LAYERS=NhaTroNT%3Anhatro&exceptions=application%2Fvnd.ogc.se_inimage&INFO_FORMAT=application%2Fjson&X=50&Y=50&SRS=EPSG%3A4326&WIDTH=101&HEIGHT=101&BBOX=109.19612415155859%2C12.264253721417447%2C109.19829137644263%2C12.26642094630148

function stylemarker(lon, lat) {
    if (vector_stylemarker) { vector_stylemarker.getSource().clear(); }

    vector_stylemarker = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([parseFloat(lon), parseFloat(lat)], 'EPSG:4326', 'EPSG:4326')),
            })]
        }),
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                anchorXUnits: "fraction",
                anchorYUnits: "fraction",
                src: "images/marker.png"
            }),
        })
    });

    map.styleLayer(vector_stylemarker);

    // setTimeout(function () {
    //     map.removeLayer(vector_stylemarker);
    // }, 5000);

    var ext_stylemarker = vector_stylemarker.getSource().getExtent();
    map.getView().fit(ext_stylemarker, { size: map.getSize(), maxZoom: 16, duration: 800 })
}