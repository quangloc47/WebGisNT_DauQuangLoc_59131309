<?php
if ((isset($_GET['kv'])) && (is_string($_GET['kv']))) { // From map2.js
    $kv = $_GET['kv'];
} else { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Trang này lỗi không lấy được id người dùng!.</p>';
    include('includes/footer.html');
    exit();
}

if ((isset($_GET['bkinh'])) && (is_string($_GET['bkinh']))) { // From map2.js
    $bkinh = $_GET['bkinh'];
}
if ($bkinh == null) { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Vui lòng nhập vào ô bán kính !</p>';
    exit();
}

if ((isset($_GET['lon'])) && (is_string($_GET['lon']))) { // From map2.js
    $lon = $_GET['lon'];
}

if ((isset($_GET['lat'])) && (is_string($_GET['lat']))) { // From map2.js
    $lat = $_GET['lat'];
}

if ($lon == null || $lat == null) { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Vui lòng check Chọn tọa độ để thực hiện lấy tọa độ trên bản đồ hoặc nhập vào tọa độ mong muốn !</p>';
}

// Nhúng file kết nối với database
include('ketnoi.php');

if ($lon && $lat) {
    $sql_buffer = "SELECT ST_ASTEXT(ST_Buffer(ST_MakePoint($lon, $lat)::geography, $bkinh)::geometry);";
    $query_buffer = pg_query($conn, $sql_buffer);
    while ($row2 = pg_fetch_array($query_buffer, NULL, PGSQL_ASSOC)) {
        $st_buffer = $row2['st_astext'];
    }
    echo '<input style="display: none" type="text" id="geometry" name="geometry" value="' . $st_buffer . '" />';
    // Lấy dữ liệu từ file tknangcao.php
    if ($kv == 'HST') {
        $sql_kv = "SELECT ti.sonha, ti.tentienich,
                        ST_X(ST_Centroid(ti.geom)) AS lon, ST_Y(ST_Centroid(ti.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich ti
                            INNER JOIN public.xaphuong ON ti.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(ti.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND ti.maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);

        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Bệnh viện</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'trhoc') {
        $sql_kv = "SELECT tentr, CONCAT(sonhatr,' ',tenduong,', ',tenpx) as address,
                        ST_X(ST_Centroid(truong.geom)) AS lon, ST_Y(ST_Centroid(truong.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.truong
                            INNER JOIN public.duong ON public.truong.maduong = public.duong.maduong
                            INNER JOIN public.xaphuong ON public.truong.mapx = public.xaphuong.mapx
                        WHERE ST_DWithin(public.truong.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Trường học</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentr'] . '</td>
                                <td>' . $row2['address'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'ntro') {
        $sql = "SELECT maphuongxa, hoten, public.user.sdt, CONCAT(sonha,' ',tenduong,', ',tenpx) as address, tentn, tenlnt, dientich, songuoio, nhavesinh, giaphong, tiencoc, tiendien, tiennuoc, giogiac, slphongtro,
                        ST_X(ST_Centroid(nhatro.geom)) AS lon, ST_Y(ST_Centroid(nhatro.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(nhatro.geom),'BOX(',''),')',''),' ',',') AS bbox,
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.nhatro
                            INNER JOIN public.user ON public.nhatro.id = public.user.id
                            INNER JOIN public.duong ON public.nhatro.maduong = public.duong.maduong
                            INNER JOIN public.tiennghi ON public.nhatro.matn = public.tiennghi.matn 
                            INNER JOIN public.loainhatro ON public.nhatro.malnt = public.loainhatro.malnt 
                            INNER JOIN public.xaphuong ON public.nhatro.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.nhatro.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)";
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
                                    <td class="number" style="text-align: center"><b>' . $i . '</b></td>
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
                                        <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                        <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'ATM') {
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>ATM - Ngân hàng</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'BOOK') {
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Nhà sách</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'MARKET') {
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Chợ</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'POST') {
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Bưu điện</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
    } else if ($kv == 'ADM') {
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Hành chính</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
        $sql_kv = "SELECT sonha, tentienich,
                        ST_X(ST_Centroid(tienich.geom)) AS lon, ST_Y(ST_Centroid(tienich.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(xaphuong.geom),'BOX(',''),')',''),' ',',') AS bbox2 
                        FROM public.tienich
                            INNER JOIN public.xaphuong ON public.tienich.maphuongxa = public.xaphuong.mapx
                        WHERE ST_DWithin(public.tienich.geom, ST_MakePoint($lon, $lat)::geography, $bkinh)
                            AND maloaiti = '$kv'";
        $query_kv = pg_query($conn, $sql_kv);
        $i = 1;
        $rows_kv = pg_num_rows($query_kv);

        if ($rows_kv > 0) {
            echo '<div class="timkiemnc">
                <div class="scrollbar2" id="style-2">
                    <div class="force-overflow2" id="kq_tkgian">';
            echo "<p style = 'text-align: center; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
            echo pg_num_rows($query_kv);
            echo " kết quả được tìm thấy</b></p>";

            echo '<table class="table-bordered tbfind" style="width: 99.9%">
                            <tr bgcolor="#eeeeee">
                                <td style="text-align: center"><b>STT</b></td>
                                <td><b>Công viên</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td style="text-align: center"><b>Vị trí</b></td>
                            </tr>';
            $bg = '#eeeeee';
            while ($row2 = pg_fetch_array($query_kv, NULL, PGSQL_ASSOC)) {
                $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
                echo '<tr bgcolor="' . $bg . '">
                                <td class="number" style="text-align: center"><b>' . $i . '</b></td>
                                <td>' . $row2['tentienich'] . '</td>
                                <td>' . $row2['sonha'] . '</td>
                                <td style="text-align: center">
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                    <button class="zoom2" id="zoom2" type="button" onclick="zoom2bbox(' . $row2['bbox2'] . ');">Bbox</button>
                                    <input style="display: none" type="text" id="longitude['.$i.']" name="longitude['.$i.']" value="' . $row2['lon'] . '" />
                                    <input style="display: none" type="text" id="latitude['.$i.']" name="latitude['.$i.']" value="' . $row2['lat'] . '" />
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
}
else {}
?>