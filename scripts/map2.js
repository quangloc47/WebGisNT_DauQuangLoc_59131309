var map;
var geojson, layer_name, layerSwitcher, featureOverlay, highlightStyle;

// Query panel using WMS & WFS service
// wms_layers_window
function wms_layers() {
    $(function () {
        $("#wms_layers_window").dialog({
            height: 400,
            width: 800,
            modal: true
        });
        $("#wms_layers_window").show();
    });

    $(document).ready(function () {
        $.ajax({
            type: "GET",
            url: "http://localhost:8080/geoserver/wms?request=getCapabilities",
            dataType: "xml",
            success: function (xml) {
                $('#table_wms_layers').empty();
                console.log("here");
                $('<tr></tr>').html('<th>Name</th><th>Title</th><th>Abstract</th>').appendTo('#table_wms_layers');
                $(xml).find('Layer').find('Layer').each(function () {
                    var name = $(this).children('Name').text();
                    var title = $(this).children('Title').text();
                    var abst = $(this).children('Abstract').text();
                    $('<tr></tr>').html('<td>' + name + '</td><td>' + title + '</td><td>' + abst + '</td>').appendTo('#table_wms_layers');
                });
                addRowHandlers();
            }
        });
    });

    var divContainer = document.getElementById("wms_layers_window");
    var table1 = document.getElementById("table_wms_layers");
    divContainer.innerHTML = "";
    divContainer.appendChild(table1);
    $("#wms_layers_window").show();

    var add_map_btn = document.createElement("BUTTON");
    add_map_btn.setAttribute("id", "add_map_btn");
    add_map_btn.innerHTML = "Add Layer to Map";
    add_map_btn.setAttribute("onclick", "add_layer()");
    divContainer.appendChild(add_map_btn);

    function addRowHandlers() {
        var rows = document.getElementById("table_wms_layers").rows;
        var table = document.getElementById('table_wms_layers');
        var heads = table.getElementsByTagName('th');
        var col_no;
        for (var i = 0; i < heads.length; i++) {
            // Take each cell
            var head = heads[i];
            if (head.innerHTML == 'Name') {
                col_no = i + 1;
            }
        }
        for (i = 0; i < rows.length; i++) {
            rows[i].onclick = function () {
                return function () {
                    $(function () {
                        $("#table_wms_layers td").each(function () {
                            $(this).parent("tr").css("background-color", "white");
                        });
                    });
                    var cell = this.cells[col_no - 1];
                    layer_name = cell.innerHTML;
                    $(document).ready(function () {
                        $("#table_wms_layers td:nth-child(" + col_no + ")").each(function () {
                            if ($(this).text() == layer_name) {
                                $(this).parent("tr").css("background-color", "grey");
                            }
                        });
                    });
                };
            }(rows[i]);
        }
    }
}

function add_layer() {
    var name = layer_name.split(":");

    var layer_wms = new ol.layer.Image({
        title: name[1],
        source: new ol.source.ImageWMS({
            url: 'http://localhost:8080/geoserver/wms',
            params: { 'LAYERS': layer_name },
            ratio: 1,
            serverType: 'geoserver'
        })
    });
    overlays.getLayers().push(layer_wms);

    var url = 'http://localhost:8080/geoserver/wms?request=getCapabilities';
    var parser = new ol.format.WMSCapabilities();

    $.ajax(url).then(function (response) {
        var result = parser.read(response);
        var Layers = result.Capability.Layer.Layer;
        var extent;
        for (var i = 0, len = Layers.length; i < len; i++) {
            var layerobj = Layers[i];
            if (layerobj.Name == layer_name) {
                extent = layerobj.BoundingBox[0].extent;
                map.getView().fit(
                    extent,
                    { maxZoom: 16, duration: 1590, size: map.getSize() }
                );

            }
        }
    });

    layerSwitcher.renderPanel();
    legend();
}

// layers_name
$(document).ready(function () {
    $.ajax({
        type: "GET",
        url: "http://localhost:8080/geoserver/wfs?request=getCapabilities",
        dataType: "xml",
        success: function (xml) {
            var select = $('#layer');
            $(xml).find('FeatureType').each(function () {
                var name = $(this).find('Name').text();
                $(this).find('Name').each(function () {
                    var value = $(this).text();
                    select.append("<option class='ddindent' value='" + value + "'>" + value + "</option>");
                });
            });
        }
    });
});

// attributes_dropdown
$(function () {
    $("#layer").change(function () {
        var attributes = document.getElementById("attributes");
        var length = attributes.options.length;
        for (i = length - 1; i >= 0; i--) {
            attributes.options[i] = null;
        }

        var value_layer = $(this).val();

        attributes.options[0] = new Option('Chọn thuộc tính', "");

        $(document).ready(function () {
            $.ajax({
                type: "GET",
                url: "http://localhost:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" + value_layer,
                dataType: "xml",
                success: function (xml) {
                    var select = $('#attributes');
                    $(xml).find('xsd\\:sequence').each(function () {
                        $(this).find('xsd\\:element').each(function () {
                            var value = $(this).attr('name');
                            var type = $(this).attr('type');
                            if (value != 'geom' && value != 'the_geom') {
                                select.append("<option class='ddindent' value='" + type + "'>" + value + "</option>");
                            }
                        });
                    });
                }
            });
        });
    });
});

// operator combo
$(function () {
    $("#attributes").change(function () {
        var operator = document.getElementById("operator");
        var length = operator.options.length;
        for (i = length - 1; i >= 0; i--) {
            operator.options[i] = null;
        }

        var value_type = $(this).val();

        var value_attribute = $('#attributes option:selected').text();
        operator.options[0] = new Option('Chọn toán tử', "");

        if (value_type == 'xsd:short' || value_type == 'xsd:int' || value_type == 'xsd:double') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Lớn hơn', '>');
            operator1.options[2] = new Option('Nhỏ hơn', '<');
            operator1.options[3] = new Option('Bằng', '=');
        }
        else if (value_type == 'xsd:string') {
            var operator1 = document.getElementById("operator");
            operator1.options[1] = new Option('Like', 'ILike');
        }
    });
});

var highlightStyle = new ol.style.Style({
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.4)',
    }),
    stroke: new ol.style.Stroke({
        color: '#3399CC',
        width: 3,
    }),
    image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({
            color: '#3399CC'
        })
    })
});

featureOverlay = new ol.layer.Vector({
    source: new ol.source.Vector(),
    map: map,
    style: highlightStyle
});

function findRowNumber(cn1, v1) {
    var table = document.querySelector('#table');
    var rows = table.querySelectorAll("tr");
    var msg = "No such row exist"
    for (i = 1; i < rows.length; i++) {
        var tableData = rows[i].querySelectorAll("td");
        if (tableData[cn1 - 1].textContent == v1) {
            msg = i;
            break;
        }
    }
    return msg;
}


function addRowHandlers() {
    var rows = document.getElementById("table").rows;
    var heads = table.getElementsByTagName('th');
    var col_no;
    for (var i = 0; i < heads.length; i++) {
        // Take each cell
        var head = heads[i];
        if (head.innerHTML == 'id') {
            col_no = i + 1;
        }
    }
    for (i = 0; i < rows.length; i++) {
        rows[i].onclick = function () {
            return function () {
                featureOverlay.getSource().clear();

                $(function () {
                    $("#table td").each(function () {
                        $(this).parent("tr").css("background-color", "white");
                    });
                });
                var cell = this.cells[col_no - 1];
                var id = cell.innerHTML;


                $(document).ready(function () {
                    $("#table td:nth-child(" + col_no + ")").each(function () {
                        if ($(this).text() == id) {
                            $(this).parent("tr").css("background-color", "grey");
                        }
                    });
                });

                var features = geojson.getSource().getFeatures();

                for (i = 0; i < features.length; i++) {
                    if (features[i].getId() == id) {
                        featureOverlay.getSource().addFeature(features[i]);

                        featureOverlay.getSource().on('addfeature', function () {
                            map.getView().fit(
                                featureOverlay.getSource().getExtent(),
                                { maxZoom: 16, duration: 1590, size: map.getSize() }
                            );
                        });
                    }
                }
            };
        }(rows[i]);
    }
}

function highlight(evt) {
    featureOverlay.getSource().clear();
    var feature = map.forEachFeatureAtPixel(evt.pixel,
        function (feature, layer) {
            return feature;
        });

    if (feature) {
        var geometry = feature.getGeometry();
        var coord = geometry.getCoordinates();
        var coordinate = evt.coordinate;

        $(function () {
            $("#table td").each(function () {
                $(this).parent("tr").css("background-color", "white");
            });
        });

        featureOverlay.getSource().addFeature(feature);
    }

    var table = document.getElementById('table');
    var cells = table.getElementsByTagName('td');
    var rows = document.getElementById("table").rows;
    var heads = table.getElementsByTagName('th');
    var col_no;
    for (var i = 0; i < heads.length; i++) {
        // Take each cell
        var head = heads[i];
        if (head.innerHTML == 'id') {
            col_no = i + 1;
        }

    }
    var row_no = findRowNumber(col_no, feature.getId());

    var rows = document.querySelectorAll('#table tr');

    rows[row_no].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    $(document).ready(function () {
        $("#table td:nth-child(" + col_no + ")").each(function () {
            if ($(this).text() == feature.getId()) {
                $(this).parent("tr").css("background-color", "grey");

            }
        });
    });
};

function query() {
    $('#table').empty();
    if (geojson) {
        map.removeLayer(geojson);
    }

    if (featureOverlay) {
        featureOverlay.getSource().clear();
        map.removeLayer(featureOverlay);
    }

    var layer = document.getElementById("layer");
    var value_layer = layer.options[layer.selectedIndex].value;

    var attribute = document.getElementById("attributes");
    var value_attribute = attribute.options[attribute.selectedIndex].text;

    var operator = document.getElementById("operator");
    var value_operator = operator.options[operator.selectedIndex].value;

    var txt = document.getElementById("value");
    var value_txt = txt.value;

    if (value_operator == 'ILike') {
        value_txt = "" + value_txt + "%25";
    }
    else {
        value_txt = value_txt;
    }

    var url = "http://localhost:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" + value_layer + "&CQL_FILTER=" + value_attribute + "+" + value_operator + "+'" + value_txt + "'&outputFormat=application/json"

    var style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.4)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    });

    geojson = new ol.layer.Vector({
        source: new ol.source.Vector({
            url: url,
            format: new ol.format.GeoJSON()
        }),
        style: style,
    });

    geojson.getSource().on('addfeature', function () {
        map.getView().fit(
            geojson.getSource().getExtent(),
            { maxZoom: 16, duration: 1590, size: map.getSize() }
        );
    });

    map.addLayer(geojson);

    $.getJSON(url, function (data) {
        var col = [];
        col.push('id');
        for (var i = 0; i < data.features.length; i++) {
            for (var key in data.features[i].properties) {
                if (col.indexOf(key) === -1) {
                    col.push(key);
                }
            }
        }

        var table = document.createElement("table");

        table.setAttribute("class", "table table-bordered");
        table.setAttribute("id", "table");
        // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

        var tr = table.insertRow(-1);                   // TABLE ROW.

        for (var i = 0; i < col.length; i++) {
            var th = document.createElement("th");      // TABLE HEADER.
            th.innerHTML = col[i];
            tr.appendChild(th);
        }

        // ADD JSON DATA TO THE TABLE AS ROWS.
        for (var i = 0; i < data.features.length; i++) {

            tr = table.insertRow(-1);

            for (var j = 0; j < col.length; j++) {
                var tabCell = tr.insertCell(-1);
                if (j == 0) { tabCell.innerHTML = data.features[i]['id']; }
                else {
                    tabCell.innerHTML = data.features[i].properties[col[j]];
                }
            }
        }

        // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
        var divContainer = document.getElementById("table_data");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
        addRowHandlers();

        document.getElementById('map').style.height = '100%';
        document.getElementById('table_data').style.height = '500px';
        map.updateSize();
    });

    map.on('click', highlight);

    addRowHandlers();
}

function clear_all() {
    document.getElementById('map').style.height = '96%';
    document.getElementById('table_data').style.height = '0%';
    map.updateSize();
    $('#table').empty();
    if (geojson) { geojson.getSource().clear(); map.removeLayer(geojson); }
    if (featureOverlay) { featureOverlay.getSource().clear(); map.removeLayer(featureOverlay); }
    map.removeInteraction(draw);
    if (vectorLayer) { vectorLayer.getSource().clear(); }
    map.removeOverlay(helpTooltip);
    if (measureTooltipElement) {
        var elem = document.getElementsByClassName("tooltip tooltip-static");

        for (var i = elem.length - 1; i >= 0; i--) {
            elem[i].remove();
        }
    }
    map.un('singleclick', getinfo);
    overlay.setPosition(undefined);
    closer.blur();

    map.un('click', highlight);
}
// End Query panel using WMS & WFS service

// Zoom tới khu vực
function zoom2bbox(a, b, c, d) {
    var ext_zoom2bbox = [a, b, c, d];

    ext_zoom2bbox = ol.extent.applyTransform(ext_zoom2bbox, ol.proj.getTransform("EPSG:4326", "EPSG:4326"));

    var vector_zoom2bbox = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [new ol.Feature({
                geometry: new ol.geom.Polygon.fromExtent(ext_zoom2bbox),
            })]
        }),
        style: new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'blue'
            }),
            fill: new ol.style.Fill({
                color: '#0000ff1a'
            })
        })
    });

    map.addLayer(vector_zoom2bbox);

    map.getView().fit(ext_zoom2bbox, { size: map.getSize(), duration: 800 })
}
// End zoom tới khu vực

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

    $($("#submit")).trigger('click');
    // for (var i=0; i<12; i++);
    // $('#submit')[i].trigger('click');
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

// Tìm kiếm không gian
function tkgian() {
    var xaphuong = document.getElementById("xaphuong").value;

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
            document.getElementById("kq_tkgian").innerHTML = xmlhttp.responseText;
        }
    }
    xmlhttp.open("GET", "xltk_kgian.php?xp=" + xaphuong, true);
    xmlhttp.send();
}
// End tìm kiếm không gian

// Thêm marker khi nhấn zoom
function addmarker(lon, lat) {
    var vector_addmarker = new ol.layer.Vector({
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

    map.addLayer(vector_addmarker);

    setTimeout(function () {
        map.removeLayer(vector_addmarker);
    }, 5000);

    var ext_addmarker = vector_addmarker.getSource().getExtent();
    map.getView().fit(ext_addmarker, { size: map.getSize(), maxZoom: 16, duration: 800 })
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
        // target: document.getElementById('location'),
        coordinateFormat: ol.coordinate.createStringXY(6),
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
                "exceptions": 'application/vnd.ogc.se_inimage',
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
    });

    map = new ol.Map({
        controls: ol.control.defaults({
            attribution: false
        }).extend([mousePositionControl, scaleControl(), new ol.control.FullScreen({
            source: 'fullscreen',
            label: 'F'
        })]),
        interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
        overlays: [overlay],
        target: 'map',
        loadTilesWhileAnimating: true,
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
            projection: projection,
            center: [0, 0],
            zoom: 2,
        })
    });
    // End Chồng các lớp layers vào Map

    // Overview map
    var OSM = new ol.layer.Tile({
        source: new ol.source.OSM(),
        type: 'base',
        title: 'OSM',
    });

    var view_ov = new ol.View({
        projection: 'EPSG:4326',
        center: [78.0, 23.0],
        zoom: 5,
    });

    var overview = new ol.control.OverviewMap({
        view: view_ov,
        collapseLabel: 'O',
        label: 'O',
        layers: [OSM]
    });

    map.addControl(overview);
    // End Overview map

    // Zoom to extent map TPNT
    var zoom_ex = new ol.control.ZoomToExtent({
        extent: [
            109.11119079589844, 12.140848159790039,
            109.37165832519531, 12.379751205444336
        ]
    });
    map.addControl(zoom_ex);
    // End Zoom to extent map TPNT

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
        }),
        'fill': new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.7)'
        }),
        'stroke': new ol.style.Stroke({
            color: '#ffcc33',
            width: 3
        }),
        'image': new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33'
            })
        })
    };

    var styleFunction = function (feature) {
        return styles[feature.getGeometry().getType()];
    };
    var vectorLayer_Highlight = new ol.layer.Vector({
        style: styleFunction
    });
    map.addLayer(vectorLayer_Highlight);
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

    // Show the user's location
    const locate = document.createElement('div');
    locate.className = 'ol-control ol-unselectable locate';
    locate.innerHTML = '<button title="Locate me">◎</button>';
    locate.addEventListener('click', function () {
        if (!source_locate.isEmpty()) {
            map.getView().fit(source_locate.getExtent(), {
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

    var source_locate = new ol.source.Vector({
        features: [accuracyFeature, positionFeature],
    });

    const layer_locate = new ol.layer.Vector({
        source: source_locate
    });

    $('#track').on('click', function () {
        var isChecked = $(this).is(':checked');
        if (isChecked) {
            map.addLayer(layer_locate);
            setTimeout(function () {
                if (!source_locate.isEmpty()) {
                    map.getView().fit(source_locate.getExtent(), {
                        maxZoom: 16,
                        duration: 800
                    });
                };
            }, 1000);
        } else {
            map.removeLayer(layer_locate);
        }
    });
    // End Show the user's location

    // Tìm đường đi
    var startPoint = new ol.Feature();
    var destPoint = new ol.Feature();

    var vectorLayer_RoadFind = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [startPoint, destPoint]
        })
    });

    map.addLayer(vectorLayer_RoadFind);

    function roadfind(evt) {
        if (startPoint.getGeometry() == null) {
            // First click.
            startPoint.setGeometry(new ol.geom.Point(evt.coordinate));
            $("#txtPoint1").val(evt.coordinate);
        } else if (destPoint.getGeometry() == null) {
            // Second click.
            destPoint.setGeometry(new ol.geom.Point(evt.coordinate));
            $("#txtPoint2").val(evt.coordinate);
        }
    }

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

    $("#chkRoadFind").on('click', function () {
        var isChecked = $(this).is(':checked');
        if (isChecked) {
            map.on('singleclick', roadfind);
        }
        else {
            // history.go(0);
            map.un('singleclick', roadfind);
        }
    });
    // End Tìm đường đi

    // Singleclick Nhà trọ
    function getinfo_nhatro(evt) {
        document.getElementById('info').innerHTML = 'Đang tải...Vui lòng đợi...';
        var view_motel = map.getView();
        var wmsSource_motel = NhaTro.getSource();
        var viewResolution_motel = /** @type {number} */ (view_motel.getResolution());
        var url = wmsSource_motel.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution_motel,
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
                    var content_motel = "<table class='table table-bordered'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content_motel += "<tr><th>Diện tích</th><th>Số người ở tối đa</th><th>Nhà vệ sinh</th><th>Giá phòng</th>"
                            + "<th>Tiền cọc</th><th>Tiền điện</th><th>Tiền nước</th><th>Giờ giấc</th>"
                            + "<th>SL phòng trống</th><th>Liên hệ</th></tr><tr>"
                            + "<td>" + featureAttr["dientich"] + "m2</td><td>"
                            + featureAttr["songuoio"] + "</td><td>" + featureAttr["nhavesinh"] + "</td><td>"
                            + parseInt(featureAttr["giaphong"]).toLocaleString() + "đ/tháng</td><td>" + parseInt(featureAttr["tiencoc"]).toLocaleString() + "đ</td><td>"
                            + parseInt(featureAttr["tiendien"]).toLocaleString() + "đ/1 kWh</td><td>" + parseInt(featureAttr["tiennuoc"]).toLocaleString() + "đ/m3</td><td>"
                            + featureAttr["giogiac"] + "</td><td>" + featureAttr["slphongtro"] + "</td>"
                            + "<td>" + featureAttr["sdt"] + "</td></tr>"
                    }
                    content_motel += "</table>";

                    var content_motel1 = "<table border='0' class='popup2'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content_motel1 += "<tr><td><b>Diện tích: </b>" + featureAttr["dientich"] + "m2</td></tr>"
                            + "<tr><td><b>Số người ở tối đa: </b>" + featureAttr["songuoio"] + "</td></tr>"
                            + "<tr><td><b>Nhà vệ sinh: </b>" + featureAttr["nhavesinh"] + "</td></tr>"
                            + "<tr><td><b>Giá phòng: </b>" + parseInt(featureAttr["giaphong"]).toLocaleString() + "đ</td></tr>"
                            + "<tr><td><b>Giờ giấc: </b>" + featureAttr["giogiac"] + "</td></tr>"
                            + "<tr><td><b>Số lượng phòng trống: </b>" + featureAttr["slphongtro"] + "</td></tr>"
                    }
                    content_motel1 += "</table>";
                    $("#info").html(content_motel);
                    $("#popup-content").html(content_motel1);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource_motel = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer_Highlight.setSource(vectorSource_motel);
                }
            });
        }
    }
    // End Singleclick Nhà trọ

    // Singleclick Tiện ích
    function getinfo_tienich(evt) {
        var view_utis = map.getView();
        var wmsSource_utis = TienIch.getSource();
        var viewResolution_utis = /** @type {number} */ (view_utis.getResolution());
        var url = wmsSource_utis.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution_utis,
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
                    var content_utis = "<table border='0' class='popup2'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content_utis += "<tr><td><b>" + featureAttr["tentienich"] + "</b></td></tr>"
                            + "<tr><td>Địa chỉ: " + featureAttr["sonha"] + "</td></tr>"
                    }
                    content_utis += "</table>";
                    $("#popup-content").html(content_utis);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource_utis = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer_Highlight.setSource(vectorSource_utis);
                }
            });
        }
    }
    // End Singleclick Tiện ích

    // Singleclick Trạm bus
    function getinfo_trambus(evt) {
        var view_bus = map.getView();
        var wmsSource_bus = TramBus.getSource();
        var viewResolution_bus = /** @type {number} */ (view_bus.getResolution());
        var url = wmsSource_bus.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution_bus,
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
                    var content_bus = "<table class='popup_bus'>";
                    for (var i = 0; i < n.features.length; i++) {
                        var feature = n.features[i];
                        var featureAttr = feature.properties;
                        content_bus += "<tr><td><b>" + featureAttr["tenbus"] + "</b></td></tr>"
                    }
                    content_bus += "</table>";
                    $("#popup-content").html(content_bus);
                    overlay.setPosition(evt.coordinate);

                    var vectorSource_bus = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer_Highlight.setSource(vectorSource_bus);
                }
            });
        }
    }
    // End Singleclick Trạm bus

    // Activate_getinfo hoặc Deactivate_getinfo
    getinfotype.onchange = function () {
        map.removeInteraction(draw);
        if (vector_measure) { vector_measure.getSource().clear(); }
        map.removeOverlay(helpTooltip);
        if (measureTooltipElement) {
            var elem = document.getElementsByClassName("tooltip tooltip-static");

            for (var i = elem.length - 1; i >= 0; i--) {
                elem[i].remove();
                //alert(elem[i].innerHTML);
            }
        }

        if (getinfotype.value == 'activate_getinfo') {
            map.on('singleclick', getinfo_nhatro);
            map.on('singleclick', getinfo_tienich);
            map.on('singleclick', getinfo_trambus);
        }
        else if (getinfotype.value == 'select' || getinfotype.value == 'deactivate_getinfo') {
            map.un('singleclick', getinfo_nhatro);
            map.un('singleclick', getinfo_tienich);
            map.un('singleclick', getinfo_trambus);
            overlay.setPosition(undefined);
            closer.blur();
        }
    };
    // End Activate_getinfo hoặc Deactivate_getinfo

    // Pointermove Xã phường
    map.on('pointermove', function (evt) {
        var view_wards = map.getView();
        var wmsSource_wards = XaPhuong.getSource();
        var viewResolution_wards = /** @type {number} */ (view_wards.getResolution());
        var url = wmsSource_wards.getFeatureInfoUrl(
            evt.coordinate,
            viewResolution_wards,
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
                    var vectorSource_wards = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(n)
                    });

                    vectorLayer_Highlight.setSource(vectorSource_wards);
                }
            });
        }
    });
    // End Pointermove Xã phường

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
    // End Thay đổi con trỏ chuột khi qua điểm đánh dấu

    // Measure(đo lường) tool
    var source_measure = new ol.source.Vector();

    var vector_measure = new ol.layer.Vector({
        source: source_measure,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                    color: '#ffcc33'
                })
            })
        })
    });

    map.addLayer(vector_measure);

    /**
       * Tính năng hiện đang được vẽ.
       * @type {module:ol/Feature~Feature}
       */
    var sketch;

    /**
     * Phần tử chú giải công cụ trợ giúp.
     * @type {Element}
     */
    var helpTooltipElement;

    /**
     * Lớp phủ để hiển thị các thông báo trợ giúp.
     * @type {module:ol/Overlay}
     */
    var helpTooltip;

    /**
     * Phần tử chú giải công cụ đo lường.
     * @type {Element}
     */
    var measureTooltipElement;

    /**
     * Lớp phủ để hiển thị phép đo.
     * @type {module:ol/Overlay}
     */
    var measureTooltip;

    /**
     * Thông báo hiển thị khi người dùng đang vẽ một đa giác.
     * @type {string}
     */
    var continuePolygonMsg = 'Nhấp để tiếp tục vẽ đa giác';

    /**
     * Thông báo hiển thị khi người dùng đang vẽ một đường thẳng.
     * @type {string}
     */
    var continueLineMsg = 'Nhấp để tiếp tục vẽ đường';

    var draw; // biến vẽ toàn cục để có thể xóa nó sau

    /**
     * Định dạng đầu ra độ dài.
     * @param {module:ol/geom/LineString~LineString} line The line.
     * @return {string} Độ dài được định dạng.
     */
    var formatLength = function (line) {
        var length = ol.sphere.getLength(line, { projection: 'EPSG:4326' });

        var output;
        if (length > 1000) {
            output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
    };

    /**
     * Định dạng đầu ra khu vực.
     * @param {module:ol/geom/Polygon~Polygon} polygon The polygon.
     * @return {string}// Khu vực được định dạng.
     */
    var formatArea = function (polygon) {
        var area = ol.sphere.getArea(polygon, { projection: 'EPSG:4326' });

        var output;
        if (area > 10000) {
            output = Math.round((area / 10000) * 100) / 100 + ' ' + 'ha';
        } else {
            output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
    };

    function addInteraction() {
        /**
         * Xử lý di chuyển con trỏ.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
        */
        var pointerMoveHandler = function (evt) {
            if (evt.dragging) {
                return;
            }
            /** @type {string} */
            var helpMsg = 'Nhấp để bắt đầu vẽ';

            if (sketch) {
                var geom = (sketch.getGeometry());
                if (geom instanceof ol.geom.Polygon) {

                    helpMsg = continuePolygonMsg;
                } else if (geom instanceof ol.geom.LineString) {
                    helpMsg = continueLineMsg;
                }
            }

            helpTooltipElement.innerHTML = helpMsg;
            helpTooltip.setPosition(evt.coordinate);

            helpTooltipElement.classList.remove('hidden');
        };

        map.on('pointermove', pointerMoveHandler);

        map.getViewport().addEventListener('mouseout', function () {
            helpTooltipElement.classList.add('hidden');
        });
        /**
         * End Xử lý di chuyển con trỏ.
         * @param {module:ol/MapBrowserEvent~MapBrowserEvent} evt The event.
        */

        var type;
        if (measuretype.value == 'area') { type = 'Polygon'; }
        else if (measuretype.value == 'length') { type = 'LineString'; }

        draw = new ol.interaction.Draw({
            source: source_measure,
            type: type,
            style: new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 255, 255, 0.5)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2
                }),
                image: new ol.style.Circle({
                    radius: 5,
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 0, 0.7)'
                    }),
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)'
                    })
                })
            })
        });

        if (measuretype.value == 'select' || measuretype.value == 'clear') {
            map.removeInteraction(draw);
            if (vector_measure) { vector_measure.getSource().clear(); }
            map.removeOverlay(helpTooltip);

            if (measureTooltipElement) {
                var elem = document.getElementsByClassName("tooltip tooltip-static");

                for (var i = elem.length - 1; i >= 0; i--) {
                    elem[i].remove();
                }
            }
        }
        else if (measuretype.value == 'area' || measuretype.value == 'length') {
            map.addInteraction(draw);
            createMeasureTooltip();
            createHelpTooltip();

            var listener;
            draw.on('drawstart',
                function (evt) {
                    sketch = evt.feature;

                    /** @type {module:ol/coordinate~Coordinate|undefined} */
                    var tooltipCoord = evt.coordinate;

                    listener = sketch.getGeometry().on('change', function (evt) {
                        var geom = evt.target;

                        var output;
                        if (geom instanceof ol.geom.Polygon) {

                            output = formatArea(geom);
                            tooltipCoord = geom.getInteriorPoint().getCoordinates();

                        } else if (geom instanceof ol.geom.LineString) {

                            output = formatLength(geom);
                            tooltipCoord = geom.getLastCoordinate();
                        }
                        measureTooltipElement.innerHTML = output;
                        measureTooltip.setPosition(tooltipCoord);
                    });
                }, this);

            draw.on('drawend',
                function () {
                    measureTooltipElement.className = 'tooltip tooltip-static';
                    measureTooltip.setOffset([0, -7]);
                    // unset bản phác thảo
                    sketch = null;
                    // unset chú giải công cụ để có thể tạo một chú giải mới
                    measureTooltipElement = null;
                    createMeasureTooltip();
                    ol.Observable.unByKey(listener);
                }, this);
        }
    }

    /**
     * Tạo chú giải công cụ trợ giúp mới
     */
    function createHelpTooltip() {
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'tooltip hidden';
        helpTooltip = new ol.Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left'
        });
        map.addOverlay(helpTooltip);
    }

    /**
     * Tạo chú giải công cụ đo lường mới
     */
    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'tooltip tooltip-measure';

        measureTooltip = new ol.Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center'
        });
        map.addOverlay(measureTooltip);
    }

    /**
     * Cho phép người dùng thay đổi kiểu hình học.
     */
    measuretype.onchange = function () {
        map.un('singleclick', getinfo_nhatro);
        map.un('singleclick', getinfo_tienich);
        map.un('singleclick', getinfo_trambus);
        overlay.setPosition(undefined);
        closer.blur();
        map.removeInteraction(draw);
        addInteraction();
    };
    // End Measure(đo lường) tool

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
