<?php
if ((isset($_GET['xp'])) && (is_string($_GET['xp']))) { // From map2.js
    $xp = $_GET['xp'];
} else { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Trang này lỗi không lấy được id người dùng!.</p>';
    include('includes/footer.html');
    exit();
}

if ((isset($_GET['lchon'])) && (is_string($_GET['lchon']))) { // From map2.js
    $lchon = $_GET['lchon'];
}

if ((isset($_GET['bkinh'])) && (is_string($_GET['bkinh']))) { // From map2.js
    $bkinh = $_GET['bkinh'];
}
if ($bkinh == null) { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Vui lòng nhập vào ô bán kính !</p>';
    exit();
}

if ((isset($_GET['tentr'])) && (is_string($_GET['tentr']))) { // From map2.js
    $tentr = $_GET['tentr'];
}

// Nhúng file kết nối với database
include('ketnoi.php');

// Lấy dữ liệu từ file tknangcao.php
if ($xp == null && $lchon == 'trhoc') {
    $sql = "SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as address, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro,
    ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat,
    REPLACE(REPLACE(REPLACE('' || box2d(xp.geom),'BOX(',''),')',''),' ',',') AS bbox2
    FROM public.nhatro tr
        LEFT JOIN public.truong ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, $bkinh)
        INNER JOIN public.user us ON tr.id = us.id
        INNER JOIN public.duong d ON tr.maduong = d.maduong
        INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
        INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
        INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
    WHERE ti.matr = '$tentr';";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo '<div class="timkiemnc">
                    <div class="scrollbar2" id="style-2">
                        <div class="force-overflow2" id="kq_tkgian">';
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind" style="width: 99.9%">
                                <tr bgcolor="#eeeeee">
                                    <td style="text-align: center"><b>STT</b></td>
                                    <td style="width: 5%"><b>Chủ trọ</b></td>
                                    <td style="width: 11%"><b>Địa chỉ</b></td>
                                    <td style="width: 10%"><b>Liên hệ</b></td>
                                    <td style="width: 10%"><b>Loại nhà trọ</b></td>
                                    <td style="width: 5%"><b>Diện tích</b></td>
                                    <td style="width: 10%"><b>Tiền cọc, phòng</b></td>
                                    <td style="width: 19%"><b>Giá điện, nước</b></td>
                                    <td style="width: 20%"><b>Thông tin chung</b></td>
                                    <td style="text-align: center"><b>Vị trí</b></td>
                                </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                    <td style="text-align: center"><b>' . $i . '</b></td>
                                    <td>' . $row2['hoten'] . '</td>
                                    <td>' . $row2['address'] . '</td>
                                    <td>' . $row2['sdt'] . '</td>
                                    <td>' . $row2['tenlnt'] . '</td>
                                    <td>' . $row2['dientich'] . 'm2</td>
                                    <td>
                                        <b><i>Tiền cọc:</i></b> ' . number_format($row2['tiencoc'], 0, ',', '.') . 'đ</br>
                                        <b><i>Tiền phòng:</i></b> ' . number_format($row2['giaphong'], 0, ',', '.') . 'đ/tháng
                                    </td>
                                    <td>
                                        <b><i>Giá điện:</i></b> ' . number_format($row2['tiendien'], 0, ',', '.') . '/1 kWh</br>
                                        <b><i>Giá nước:</i></b> ' . number_format($row2['tiennuoc'], 0, ',', '.') . 'đ/m3
                                    </td>
                                    <td>
                                        <b><i>Giờ giấc:</i></b> ' . $row2['giogiac'] . ' </br>
                                        <b><i>Nhà vệ sinh:</i></b> ' . $row2['nhavesinh'] . '</br>
                                        <b><i>Số người ở:</i></b> ' . $row2['songuoio'] . '</br>
                                        <b><i>Tiện nghi:</i></b> ' . $row2['tentn'] . '</br>
                                        <b><i>SL phòng trống:</i></b> ' . $row2['slphongtro'] . '
                                    </td>
                                    <td style="text-align: center">
                                        <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                        <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    </td>
                                </tr>';
            $i++;
        }
        echo '</table>';
        echo '</div>
            </div>
        </div>';
    } else {
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else if ($xp && $lchon == 'trhoc') {
    $sql = "SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as address, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro,
    ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat,
    REPLACE(REPLACE(REPLACE('' || box2d(xp.geom),'BOX(',''),')',''),' ',',') AS bbox2
    FROM public.nhatro tr
        LEFT JOIN public.truong ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, $bkinh)
        INNER JOIN public.user us ON tr.id = us.id
        INNER JOIN public.duong d ON tr.maduong = d.maduong
        INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
        INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
        INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
    WHERE tr.maphuongxa = '$xp' AND ti.matr = '$tentr';";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo '<div class="timkiemnc">
                    <div class="scrollbar2" id="style-2">
                        <div class="force-overflow2" id="kq_tkgian">';
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind" style="width: 99.9%">
                                <tr bgcolor="#eeeeee">
                                    <td style="text-align: center"><b>STT</b></td>
                                    <td style="width: 5%"><b>Chủ trọ</b></td>
                                    <td style="width: 11%"><b>Địa chỉ</b></td>
                                    <td style="width: 10%"><b>Liên hệ</b></td>
                                    <td style="width: 10%"><b>Loại nhà trọ</b></td>
                                    <td style="width: 5%"><b>Diện tích</b></td>
                                    <td style="width: 10%"><b>Tiền cọc, phòng</b></td>
                                    <td style="width: 19%"><b>Giá điện, nước</b></td>
                                    <td style="width: 20%"><b>Thông tin chung</b></td>
                                    <td style="text-align: center"><b>Vị trí</b></td>
                                </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                    <td style="text-align: center"><b>' . $i . '</b></td>
                                    <td>' . $row2['hoten'] . '</td>
                                    <td>' . $row2['address'] . '</td>
                                    <td>' . $row2['sdt'] . '</td>
                                    <td>' . $row2['tenlnt'] . '</td>
                                    <td>' . $row2['dientich'] . 'm2</td>
                                    <td>
                                        <b><i>Tiền cọc:</i></b> ' . number_format($row2['tiencoc'], 0, ',', '.') . 'đ</br>
                                        <b><i>Tiền phòng:</i></b> ' . number_format($row2['giaphong'], 0, ',', '.') . 'đ/tháng
                                    </td>
                                    <td>
                                        <b><i>Giá điện:</i></b> ' . number_format($row2['tiendien'], 0, ',', '.') . '/1 kWh</br>
                                        <b><i>Giá nước:</i></b> ' . number_format($row2['tiennuoc'], 0, ',', '.') . 'đ/m3
                                    </td>
                                    <td>
                                        <b><i>Giờ giấc:</i></b> ' . $row2['giogiac'] . ' </br>
                                        <b><i>Nhà vệ sinh:</i></b> ' . $row2['nhavesinh'] . '</br>
                                        <b><i>Số người ở:</i></b> ' . $row2['songuoio'] . '</br>
                                        <b><i>Tiện nghi:</i></b> ' . $row2['tentn'] . '</br>
                                        <b><i>SL phòng trống:</i></b> ' . $row2['slphongtro'] . '
                                    </td>
                                    <td style="text-align: center">
                                        <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                        <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    </td>
                                </tr>';
            $i++;
        }
        echo '</table>';
        echo '</div>
            </div>
        </div>';
    } else {
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else if ($xp && $lchon == 'HST' || $xp && $lchon == 'BOOK' || $xp && $lchon == 'ATM' || $xp && $lchon == 'MARKET' || $xp && $lchon == 'POST' || $xp && $lchon == 'ADM' || $xp && $lchon == 'PARK') {
    $sql = "SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as address, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro,
    ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat,
    REPLACE(REPLACE(REPLACE('' || box2d(xp.geom),'BOX(',''),')',''),' ',',') AS bbox2
    FROM public.nhatro tr
        LEFT JOIN public.tienich ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, $bkinh)
        INNER JOIN public.user us ON tr.id = us.id
        INNER JOIN public.duong d ON tr.maduong = d.maduong
        INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
        INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
        INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
    WHERE tr.maphuongxa = '$xp' AND ti.maloaiti = '$lchon';";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo '<div class="timkiemnc">
                    <div class="scrollbar2" id="style-2">
                        <div class="force-overflow2" id="kq_tkgian">';
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind" style="width: 99.9%">
                                <tr bgcolor="#eeeeee">
                                    <td style="text-align: center"><b>STT</b></td>
                                    <td style="width: 5%"><b>Chủ trọ</b></td>
                                    <td style="width: 11%"><b>Địa chỉ</b></td>
                                    <td style="width: 10%"><b>Liên hệ</b></td>
                                    <td style="width: 10%"><b>Loại nhà trọ</b></td>
                                    <td style="width: 5%"><b>Diện tích</b></td>
                                    <td style="width: 10%"><b>Tiền cọc, phòng</b></td>
                                    <td style="width: 19%"><b>Giá điện, nước</b></td>
                                    <td style="width: 20%"><b>Thông tin chung</b></td>
                                    <td style="text-align: center"><b>Vị trí</b></td>
                                </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                    <td style="text-align: center"><b>' . $i . '</b></td>
                                    <td>' . $row2['hoten'] . '</td>
                                    <td>' . $row2['address'] . '</td>
                                    <td>' . $row2['sdt'] . '</td>
                                    <td>' . $row2['tenlnt'] . '</td>
                                    <td>' . $row2['dientich'] . 'm2</td>
                                    <td>
                                        <b><i>Tiền cọc:</i></b> ' . number_format($row2['tiencoc'], 0, ',', '.') . 'đ</br>
                                        <b><i>Tiền phòng:</i></b> ' . number_format($row2['giaphong'], 0, ',', '.') . 'đ/tháng
                                    </td>
                                    <td>
                                        <b><i>Giá điện:</i></b> ' . number_format($row2['tiendien'], 0, ',', '.') . '/1 kWh</br>
                                        <b><i>Giá nước:</i></b> ' . number_format($row2['tiennuoc'], 0, ',', '.') . 'đ/m3
                                    </td>
                                    <td>
                                        <b><i>Giờ giấc:</i></b> ' . $row2['giogiac'] . ' </br>
                                        <b><i>Nhà vệ sinh:</i></b> ' . $row2['nhavesinh'] . '</br>
                                        <b><i>Số người ở:</i></b> ' . $row2['songuoio'] . '</br>
                                        <b><i>Tiện nghi:</i></b> ' . $row2['tentn'] . '</br>
                                        <b><i>SL phòng trống:</i></b> ' . $row2['slphongtro'] . '
                                    </td>
                                    <td style="text-align: center">
                                        <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                        <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    </td>
                                </tr>';
            $i++;
        }
        echo '</table>';
        echo '</div>
            </div>
        </div>';
    } else {
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else {
    $sql = "SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as address, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro,
    ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat,
    REPLACE(REPLACE(REPLACE('' || box2d(xp.geom),'BOX(',''),')',''),' ',',') AS bbox2
    FROM public.nhatro tr
        LEFT JOIN public.tienich ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, $bkinh)
        INNER JOIN public.user us ON tr.id = us.id
        INNER JOIN public.duong d ON tr.maduong = d.maduong
        INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
        INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
        INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
    WHERE ti.maloaiti = '$lchon';";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo '<div class="timkiemnc">
                    <div class="scrollbar2" id="style-2">
                        <div class="force-overflow2" id="kq_tkgian">';
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind" style="width: 99.9%">
                                <tr bgcolor="#eeeeee">
                                    <td style="text-align: center"><b>STT</b></td>
                                    <td style="width: 5%"><b>Chủ trọ</b></td>
                                    <td style="width: 11%"><b>Địa chỉ</b></td>
                                    <td style="width: 10%"><b>Liên hệ</b></td>
                                    <td style="width: 10%"><b>Loại nhà trọ</b></td>
                                    <td style="width: 5%"><b>Diện tích</b></td>
                                    <td style="width: 10%"><b>Tiền cọc, phòng</b></td>
                                    <td style="width: 19%"><b>Giá điện, nước</b></td>
                                    <td style="width: 20%"><b>Thông tin chung</b></td>
                                    <td style="text-align: center"><b>Vị trí</b></td>
                                </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                    <td style="text-align: center"><b>' . $i . '</b></td>
                                    <td>' . $row2['hoten'] . '</td>
                                    <td>' . $row2['address'] . '</td>
                                    <td>' . $row2['sdt'] . '</td>
                                    <td>' . $row2['tenlnt'] . '</td>
                                    <td>' . $row2['dientich'] . 'm2</td>
                                    <td>
                                        <b><i>Tiền cọc:</i></b> ' . number_format($row2['tiencoc'], 0, ',', '.') . 'đ</br>
                                        <b><i>Tiền phòng:</i></b> ' . number_format($row2['giaphong'], 0, ',', '.') . 'đ/tháng
                                    </td>
                                    <td>
                                        <b><i>Giá điện:</i></b> ' . number_format($row2['tiendien'], 0, ',', '.') . '/1 kWh</br>
                                        <b><i>Giá nước:</i></b> ' . number_format($row2['tiennuoc'], 0, ',', '.') . 'đ/m3
                                    </td>
                                    <td>
                                        <b><i>Giờ giấc:</i></b> ' . $row2['giogiac'] . ' </br>
                                        <b><i>Nhà vệ sinh:</i></b> ' . $row2['nhavesinh'] . '</br>
                                        <b><i>Số người ở:</i></b> ' . $row2['songuoio'] . '</br>
                                        <b><i>Tiện nghi:</i></b> ' . $row2['tentn'] . '</br>
                                        <b><i>SL phòng trống:</i></b> ' . $row2['slphongtro'] . '
                                    </td>
                                    <td style="text-align: center">
                                        <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                        <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    </td>
                                </tr>';
            $i++;
        }
        echo '</table>';
        echo '</div>
            </div>
        </div>';
    } else {
        echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
}
