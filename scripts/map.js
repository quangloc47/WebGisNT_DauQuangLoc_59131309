var map;
var source;

// function zoom2bbox(bbox) {
//     var arr = bbox.split(',');
//     var a = eval(arr[0]);
//     var b = eval(arr[1]);
//     var c = eval(arr[2]);
//     var d = eval(arr[3]);

//     var bound = ([a, b, c, d]);

//     var extent = bound.getSource().getExtent();
//     map.getView().fit(extent, { size: map.getSize(), maxZoom: 16, duration: 800 })
// };

// Tìm kiếm nhà trọ cơ bản
function timkiem() {
    var txtTieuChi = document.getElementById("txtTieuChi").value;
    var txtKhuVuc = document.getElementById("txtKhuVuc").value;

    if (window.XMLHttpRequest) {
        // Code for IE7+, Firefox, Chrome, Opera, Safari 
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // Code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById("divkq").innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "xltimkiem.php?tieuchi=" + txtTieuChi + "&khuvuc=" + txtKhuVuc, true);
    xmlhttp.send();
}
// End Tìm kiếm nhà trọ cơ bản

// Tìm kiếm nhà trọ nâng cao
function tknangcao() {
    var txtTenDuong = document.getElementById("txtTenDuong").value;
    var txtLPhong = document.getElementById("txtLPhong").value;
    var txtDienTich = document.getElementById("txtDienTich").value;
    var txtGPhong = document.getElementById("txtGPhong").value;
    var txtSLNguoi = document.getElementById("txtSLNguoi").value;
    var txtGDien = document.getElementById("txtGDien").value;
    var txtGNuoc = document.getElementById("txtGNuoc").value;
    var txtGioGiac = document.getElementById("txtGioGiac").value;
    var txtNVS = document.getElementById("txtNVS").value;

    if (window.XMLHttpRequest) {
        // Code for IE7+, Firefox, Chrome, Opera, Safari 
        xmlhttp = new XMLHttpRequest();
    }
    else {
        // Code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            document.getElementById("kq_tknangcao").innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "xltk_nangcao.php?tduong=" + txtTenDuong + "&lphong=" + txtLPhong + "&dtich="
        + txtDienTich + "&gphong=" + txtGPhong + "&slnguoi=" + txtSLNguoi + "&gdien=" + txtGDien + "&gnuoc="
        + txtGNuoc + "&ggiac=" + txtGioGiac + "&nvs=" + txtNVS, true);
    xmlhttp.send();
}
// End Tìm kiếm nhà trọ nâng cao

// Thêm marker khi nhấn zoom
function addmarker(lon, lat) {
    var vectorLayer = new ol.layer.Vector({
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

    map.addLayer(vectorLayer);

    var extent = vectorLayer.getSource().getExtent();
    map.getView().fit(extent, { size: map.getSize(), maxZoom: 16, duration: 800 })
}
// End Thêm marker khi nhấn zoom

$("#document").ready(function () {
    /**
     * Các yếu tố tạo nên cửa sổ bật lên.
     */
    var container = document.getElementById('popup');
    var content = document.getElementById('popup-content');
    var closer = document.getElementById('popup-closer');

    /**
     * Tạo lớp phủ để cố định cửa sổ bật lên vào bản đồ.
     */
    var overlay = new ol.Overlay({
        element: container,
        autoPan: true,
        autoPanAnimation: {
            duration: 250,
        },
    });

    /**
     * Thêm một trình xử lý nhấp chuột để ẩn cửa sổ bật lên.
     * @return {boolean} Đừng làm theo href.
     */
    closer.onclick = function () {
        overlay.setPosition(undefined);
        closer.blur();
        return false;
    };

    var format = 'image/png';

    // Định nghĩa đường bao của các lớp layers
    var wards = [109.111190795898, 12.1408491134644,
        109.371650695801, 12.3797512054443];

    var road = [109.119430541992, 12.1422233581543,
        109.334037780762, 12.3777923583984];

    var motel = [109.178504943848, 12.2653818130493,
        109.203750610352, 12.2863569259644];

    var utilities = [109.128479003906, 12.1907749176025,
        109.211807250977, 12.3342332839966];

    var school = [109.177574157715, 12.216742515564,
        109.207008361816, 12.2970743179321];

    var busstop = [109.134574890137, 12.1669702529907,
        109.214973449707, 12.375714302063];

    var city = [109.111190795898, 12.14084815979,
        109.371658325195, 12.37975025177];
    // End Định nghĩa đường bao của các lớp layers

    // Mouse location
    var mousePositionControl = new ol.control.MousePosition({
        className: 'custom-mouse-position',
        target: document.getElementById('location'),
        coordinateFormat: ol.coordinate.createStringXY(5),
        undefinedHTML: '&nbsp;'
    });
    // End Mouse location

    // Định nghĩa các lớp layers
    var TramBus = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:trambus',
            }
        })
    });

    var Truong = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:truong',
            }
        })
    });

    var TienIch = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:tienich',
            }
        })
    });

    var NhaTro = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:nhatro',
            }
        })
    });

    var Duong = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:duong',
            }
        })
    });

    var XaPhuong = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:xaphuong',
            }
        })
    });

    var ThanhPho = new ol.layer.Image({
        source: new ol.source.ImageWMS({
            ratio: 1,
            url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
            params: {
                'FORMAT': format,
                'VERSION': '1.1.1',
                "STYLES": '',
                "LAYERS": 'NhaTroNT:thanhpho',
            }
        })
    });
    // End Định nghĩa các lớp layers

    // Định nghĩa tọa độ, hệ quy chiếu WGS84
    var projection = new ol.proj.Projection({
        code: 'EPSG:4326',
        units: 'degrees',
        axisOrientation: 'neu'
    });
    // End Định nghĩa tọa độ, hệ quy chiếu WGS84

    // Bar scale
    var scaleBarSteps = 4;
    var scaleBarText = true;
    var control;

    function scaleControl() {
        control = new ol.control.ScaleLine({
            units: 'metric',
            bar: true,
            steps: scaleBarSteps,
            text: scaleBarText,
            minWidth: 140,
        });
        return control;
    }
    // End Bar scale

    // Chồng các lớp layers vào Map
    var view = new ol.View({
        projection: projection
    })

    map = new ol.Map({
        controls: ol.control.defaults({
            attribution: false
        }).extend([mousePositionControl, scaleControl(), new ol.control.FullScreen({
            source: 'fullscreen',
        })]),
        overlays: [overlay],
        target: 'map',
        // view: view,
        layers: [
            ThanhPho,
            XaPhuong,
            Duong,
            TramBus,
            TienIch,
            Truong,
            NhaTro
        ],
        view: new ol.View({
            projection: projection
        })
    });
    // End Chồng các lớp layers vào Map

    // Highlight đối tượng
    var styles = {
        'MultiPolygon': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'MultiLineString': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'MultiPoint': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'GeometryCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'Feature': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        }),
        'FeatureCollection': new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'yellow',
                width: 2
            })
        })
    };

    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorLayer = new ol.layer.Vector({
        style: styleFunction
    });
    map.addLayer(vectorLayer);
    // End Highlight đối tượng

    // Thanh zoom
    var zoomslider = new ol.control.ZoomSlider();
    map.addControl(zoomslider);
    // End Thanh zoom

    map.getView().getCenter();
    map.getView().fit(wards, map.getSize());
    map.getView().fit(road, map.getSize());
    map.getView().fit(utilities, map.getSize());
    map.getView().fit(motel, map.getSize());
    map.getView().fit(school, map.getSize());
    map.getView().fit(busstop, map.getSize());
    map.getView().fit(city, map.getSize());

    // Tìm đường đi
    $("#chkRoadFind").change(function () {
        if ($("#chkRoadFind").is(":checked")) {
            var startPoint = new ol.Feature();
            var destPoint = new ol.Feature();

            var vectorLayer2 = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [startPoint, destPoint]
                })
            });

            map.addLayer(vectorLayer2);

            map.on('singleclick', function (evt) {
                if (startPoint.getGeometry() == null) {
                    // First click.
                    startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
                    $("#txtPoint1").val(evt.coordinate);
                } else if (destPoint.getGeometry() == null) {
                    // Second click.
                    destPoint.setGeometry(new ol.geom.Point(evt.coordinate));
                    $("#txtPoint2").val(evt.coordinate);
                }
            });

            $("#btnSolve").click(function () {
                var startCoord = startPoint.getGeometry().getCoordinates();
                var destCoord = destPoint.getGeometry().getCoordinates();
                var params = {
                    LAYERS: 'NhaTroNT:route',
                    FORMAT: 'image/png'
                };
                var viewparams = [
                    'x1:' + startCoord[0], 'y1:' + startCoord[1],
                    'x2:' + destCoord[0], 'y2:' + destCoord[1]
                ];
                params.viewparams = viewparams.join(';');
                result = new ol.layer.Image({
                    source: new ol.source.ImageWMS({
                        url: 'http://localhost:8080/geoserver/NhaTroNT/wms',
                        params: params
                    })
                });

                map.addLayer(result);
            });

            $("#btnReset").click(function () {
                $("#txtPoint1").val(null);
                $("#txtPoint2").val(null);
                startPoint.setGeometry(null);
                destPoint.setGeometry(null);
                // Remove the result layer.
                map.removeLayer(result);
            });
        }
        else {
            history.go(0);
        }
    });
    // End Tìm đường đi

    // Show the user's location
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = '<button title="Locate me">◎</button>';
    locate.addEventListener('click', function () {
        if (!source.isEmpty()) {
            map.getView().fit(source.getExtent(), {
                maxZoom: 16,
                duration: 800
            });
        }
    });
    map.addControl(new ol.control.Control({
        element: locate
    }));

    var geolocation = new ol.Geolocation({
        // enableHighAccuracy phải được đặt thành true để có giá trị.
        trackingOptions: {
            enableHighAccuracy: true,
        },
        projection: view.getProjection(),
    });

    function el(id) {
        return document.getElementById(id);
    }

    el('track').addEventListener('change', function () {
        geolocation.setTracking(this.checked);
    });

    // xử lý lỗi vị trí địa lý.
    geolocation.on('error', function (error) {
        var info = document.getElementById('info');
        info.innerHTML = error.message;
        info.style.display = '';
    });

    var accuracyFeature = new ol.Feature();
    geolocation.on('change:accuracyGeometry', function () {
        accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    var positionFeature = new ol.Feature();
    positionFeature.setStyle(
        new ol.style.Style({
            image: new ol.style.Circle({
                radius: 6,
                fill: new ol.style.Fill({
                    color: '#3399CC',
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2,
                }),
            }),
        })
    );

    geolocation.on('change:position', function () {
        var coordinates = geolocation.getPosition();
        positionFeature.setGeometry(coordinates ? new ol.geom.Point(coordinates) : null);
    });

    source = new ol.source.Vector({
        features: [accuracyFeature, positionFeature],
    });

    const layer = new ol.layer.Vector({
        source: source
    });

    $('#track').on('click', function () {
        var isChecked = $(this).is(':checked');
        if (isChecked) {
            map.addLayer(layer);
            setTimeout(function () {
                if (!source.isEmpty()) {
                    map.getView().fit(source.getExtent(), {
                        maxZoom: 16,
                        duration: 800
                    });
                };
            }, 100);
        } else {
            map.removeLayer(layer);
        }
    });
    // End Show the user's location

    // Singleclick Nhà trọ
    map.on('singleclick', function (evt) {
        document.getElementById('info').innerHTML = 'Đang tải...Vui lòng đợi...';
        var view = map.getView();
        var wmsSource = NhaTro.getSource();
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            'EPSG:4326',
            { 'INFO_FORMAT': 'application/json' }
        );
        if (url) {
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (n) {
                    var content = "<table class='table table-bordered'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content += "<tr><th>Diện tích</th><th>Số người ở tối đa</th><th>Nhà vệ sinh</th><th>Giá phòng</th>"
                            + "<th>Tiền cọc</th><th>Tiền điện</th><th>Tiền nước</th><th>Giờ giấc</th>"
                            + "<th>Số lượng phòng trống</th><th>Liên hệ</th></tr><tr>"
                            + "<td>" + featureAttr["dientich"] + "</td><td>"
                            + featureAttr["songuoio"] + "</td><td>" + featureAttr["nhavesinh"] + "</td><td>"
                            + featureAttr["giaphong"] + "</td><td>" + featureAttr["tiencoc"] + "</td><td>"
                            + featureAttr["tiendien"] + "</td><td>" + featureAttr["tiennuoc"] + "</td><td>"
                            + featureAttr["giogiac"] + "</td><td>" + featureAttr["slphongtro"] + "</td>"
                            + "<td>" + featureAttr["sdt"] + "</td></tr>"
                    }
                    content += "</table>";

                    var content1 = "<table border='0' class='popup2'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content1 += "<tr><td><b>Diện tích: </b>" + featureAttr["dientich"] + "</td></tr>"
                            + "<tr><td><b>Số người ở tối đa: </b>" + featureAttr["songuoio"] + "</td></tr>"
                            + "<tr><td><b>Nhà vệ sinh: </b>" + featureAttr["nhavesinh"] + "</td></tr>"
                            + "<tr><td><b>Giá phòng: </b>" + featureAttr["giaphong"] + "</td></tr>"
                            + "<tr><td><b>Giờ giấc: </b>" + featureAttr["giogiac"] + "</td></tr>"
                            + "<tr><td><b>Số lượng phòng trống: </b>" + featureAttr["slphongtro"] + "</td></tr>"
                    }
                    content1 += "</table>";
                    $("#info").html(content);
                    $("#popup-content").html(content1);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer.setSource(vectorSource);
                }
            });
        }
    });
    // End Singleclick Nhà trọ

    // Singleclick Tiện ích
    map.on('singleclick', function (evt) {
        document.getElementById('info').innerHTML = 'Đang tải...Vui lòng đợi...';
        var view = map.getView();
        var wmsSource = TienIch.getSource();
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            'EPSG:4326',
            { 'INFO_FORMAT': 'application/json' }
        );
        if (url) {
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (n) {
                    var content = "<table border='0' class='popup2'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content += "<tr><td><b>" + featureAttr["tentienich"] + "</b></td></tr>"
                            + "<tr><td>Địa chỉ: " + featureAttr["sonha"] + "</td></tr>"
                    }
                    content += "</table>";
                    // $("#info").html(content);
                    $("#popup-content").html(content);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer.setSource(vectorSource);
                }
            });
        }
    });
    // End Singleclick Tiện ích

    // Singleclick Trạm bus
    map.on('singleclick', function (evt) {
        document.getElementById('info').innerHTML = 'Đang tải...Vui lòng đợi...';
        var view = map.getView();
        var wmsSource = TramBus.getSource();
        var viewResolution = /** @type {number} */ (view.getResolution());
        var url = wmsSource.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution,
            'EPSG:4326',
            { 'INFO_FORMAT': 'application/json' }
        );
        if (url) {
            $.ajax({
                type: "POST",
                url: url,
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (n) {
                    var content = "<table class='popup_bus'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content += "<tr><td><b>" + featureAttr["tenbus"] + "</b></td></tr>"
                    }
                    content += "</table>";
                    // $("#info").html(content);
                    $("#popup-content").html(content);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer.setSource(vectorSource);
                }
            });
        }
    });
    // End Singleclick Trạm bus

    // Thay đổi con trỏ chuột khi qua điểm đánh dấu
    map.on('pointermove', function (evt) {
        if (evt.dragging) {
            return;
        }
        var pixel = map.getEventPixel(evt.originalEvent);
        var hit = map.forEachLayerAtPixel(pixel, function () {
            return true;
        });
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // Bật tắt layers
    $("#chkThanhPho").change(function () {
        if ($("#chkThanhPho").is(":checked")) {
            ThanhPho.setVisible(true);
        }
        else {
            ThanhPho.setVisible(false);
        }
    });

    $("#chkXaPhuong").change(function () {
        if ($("#chkXaPhuong").is(":checked")) {
            XaPhuong.setVisible(true);
        }
        else {
            XaPhuong.setVisible(false);
        }
    });

    $("#chkDuong").change(function () {
        if ($("#chkDuong").is(":checked")) {
            Duong.setVisible(true);
        }
        else {
            Duong.setVisible(false);
        }
    });

    $("#chkBus").change(function () {
        if ($("#chkBus").is(":checked")) {
            TramBus.setVisible(true);
        }
        else {
            TramBus.setVisible(false);
        }
    });

    $("#chkTienIch").change(function () {
        if ($("#chkTienIch").is(":checked")) {
            TienIch.setVisible(true);
        }
        else {
            TienIch.setVisible(false);
        }
    });

    $("#chkTruong").change(function () {
        if ($("#chkTruong").is(":checked")) {
            Truong.setVisible(true);
        }
        else {
            Truong.setVisible(false);
        }
    });

    $("#chkNhaTro").change(function () {
        if ($("#chkNhaTro").is(":checked")) {
            NhaTro.setVisible(true);
        }
        else {
            NhaTro.setVisible(false);
        }
    });
    // End Bật tắt layers
});
