<?php
if ((isset($_GET['tieuchi'])) && (is_string($_GET['tieuchi']))) { // From index.php
    $tc = $_GET['tieuchi'];
} else if ((isset($_POST['tieuchi'])) && (is_string($_POST['tieuchi']))) { // Form submission.
    $tc = $_POST['tieuchi'];
} else { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Trang này lỗi không lấy được id người dùng!.</p>';
    include('includes/footer.html');
    exit();
}

if ((isset($_GET['khuvuc'])) && (is_string($_GET['khuvuc']))) { // Form submission.
    $kv = $_GET['khuvuc'];
} else if ((isset($_POST['khuvuc'])) && (is_string($_POST['khuvuc']))) { // Form submission.
    $kv = $_POST['khuvuc'];
} else { // Không có ID hợp lệ, hủy tập lệnh.
    echo '<p class="error">Trang này lỗi không lấy được id người dùng!.</p>';
    include('includes/footer.html');
    exit();
}

//Nhúng file kết nối với database
include('ketnoi.php');

//Lấy dữ liệu từ file index.php
$tieuchi = $tc;
$khuvuc = $kv;

if (empty($tieuchi) && ($khuvuc)) {
    $sql = "SELECT hoten, public.user.sdt, CONCAT(sonha,' ',tenduong,', ',tenpx) as address, tentn, tenlnt, dientich, songuoio, nhavesinh, giaphong, tiencoc, tiendien, tiennuoc, giogiac, slphongtro,
                        ST_X(ST_Centroid(nhatro.geom)) AS lon, ST_Y(ST_Centroid(nhatro.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(nhatro.geom),'BOX(',''),')',''),' ',',') AS bbox 
                        FROM public.nhatro
                            INNER JOIN public.user ON public.nhatro.id = public.user.id
                            INNER JOIN public.duong ON public.nhatro.maduong = public.duong.maduong
                            INNER JOIN public.tiennghi ON public.nhatro.matn = public.tiennghi.matn 
                            INNER JOIN public.loainhatro ON public.nhatro.malnt = public.loainhatro.malnt 
                            INNER JOIN public.xaphuong ON public.nhatro.maphuongxa = public.xaphuong.mapx
                        WHERE tenduong ILIKE '%$khuvuc%' OR tenpx ILIKE '%$khuvuc%'";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind">
                            <tr>
                                <td><b>STT</b></td>
                                <td><b>Họ tên Chủ trọ</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td><b>SL trống</b></td>
                                <td><b>Liên hệ</b></td>
                                <td><b>Vị trí</b></td>
                            </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                <td style="text-align: center">' . $i . '</td>
                                <td>' . $row2['hoten'] . '</td>
                                <td>' . $row2['address'] . '</td>
                                <td style="text-align: center">' . $row2['slphongtro'] . '</td>
                                <td>' . $row2['sdt'] . '</td>
                                <td>
                                    <button class="zoom" type="button" id="submit" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                </td>
                            </tr>';
            $i++;
        }
        echo '</table>';
    } else {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else if ($tieuchi && empty($khuvuc)) {
    $sql = "SELECT hoten, public.user.sdt, CONCAT(sonha,' ',tenduong,', ',tenpx) as address, tentn, tenlnt, dientich, songuoio, nhavesinh, giaphong, tiencoc, tiendien, tiennuoc, giogiac, slphongtro,
                        ST_X(ST_Centroid(nhatro.geom)) AS lon, ST_Y(ST_Centroid(nhatro.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(nhatro.geom),'BOX(',''),')',''),' ',',') AS bbox 
                        FROM public.nhatro
                            INNER JOIN public.user ON public.nhatro.id = public.user.id
                            INNER JOIN public.duong ON public.nhatro.maduong = public.duong.maduong
                            INNER JOIN public.tiennghi ON public.nhatro.matn = public.tiennghi.matn 
                            INNER JOIN public.loainhatro ON public.nhatro.malnt = public.loainhatro.malnt 
                            INNER JOIN public.xaphuong ON public.nhatro.maphuongxa = public.xaphuong.mapx
                        WHERE tentn ILIKE '%$tieuchi%'
                            OR tenlnt ILIKE '%$tieuchi%'
                            OR dientich ILIKE '%$tieuchi%'
                            OR songuoio ILIKE '%$tieuchi%'
                            OR nhavesinh ILIKE '%$tieuchi%'
                            OR giaphong ILIKE '%$tieuchi%'
                            OR tiencoc ILIKE '%$tieuchi%'
                            OR tiendien ILIKE '%$tieuchi%'
                            OR tiennuoc ILIKE '%$tieuchi%'
                            OR giogiac ILIKE '%$tieuchi%'";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind">
                            <tr>
                                <td><b>STT</b></td>
                                <td><b>Họ tên Chủ trọ</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td><b>SL trống</b></td>
                                <td><b>Liên hệ</b></td>
                                <td><b>Vị trí</b></td>
                            </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                <td style="text-align: center">' . $i . '</td>
                                <td>' . $row2['hoten'] . '</td>
                                <td>' . $row2['address'] . '</td>
                                <td style="text-align: center">' . $row2['slphongtro'] . '</td>
                                <td>' . $row2['sdt'] . '</td>
                                <td>
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                </td>
                            </tr>';
            $i++;
        }
        echo '</table>';
    } else {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else if (($tieuchi) && ($khuvuc)) {
    $sql = "SELECT hoten, public.user.sdt, CONCAT(sonha,' ',tenduong,', ',tenpx) as address, tentn, tenlnt, dientich, songuoio, nhavesinh, giaphong, tiencoc, tiendien, tiennuoc, giogiac, slphongtro,
                        ST_X(ST_Centroid(nhatro.geom)) AS lon, ST_Y(ST_Centroid(nhatro.geom)) AS lat, 
                        REPLACE(REPLACE(REPLACE('' || box2d(nhatro.geom),'BOX(',''),')',''),' ',',') AS bbox 
                        FROM public.nhatro
                            INNER JOIN public.user ON public.nhatro.id = public.user.id
                            INNER JOIN public.duong ON public.nhatro.maduong = public.duong.maduong
                            INNER JOIN public.tiennghi ON public.nhatro.matn = public.tiennghi.matn 
                            INNER JOIN public.loainhatro ON public.nhatro.malnt = public.loainhatro.malnt 
                            INNER JOIN public.xaphuong ON public.nhatro.maphuongxa = public.xaphuong.mapx
                        WHERE (tentn ILIKE '%$tieuchi%'
                            OR tenlnt ILIKE '%$tieuchi%'
                            OR dientich ILIKE '%$tieuchi%'
                            OR songuoio ILIKE '%$tieuchi%'
                            OR nhavesinh ILIKE '%$tieuchi%'
                            OR giaphong ILIKE '%$tieuchi%'
                            OR tiencoc ILIKE '%$tieuchi%'
                            OR tiendien ILIKE '%$tieuchi%'
                            OR tiennuoc ILIKE '%$tieuchi%'
                            OR giogiac ILIKE '%$tieuchi%')
                            AND (tenduong ILIKE '%$khuvuc%' OR tenpx ILIKE '%$khuvuc%')";

    $query = pg_query($conn, $sql);
    $i = 1;
    $rows = pg_num_rows($query);

    if ($rows > 0) {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Có ";
        echo pg_num_rows($query);
        echo " kết quả được tìm thấy</b></p>";

        echo '<table class="table-bordered tbfind">
                            <tr>
                                <td><b>STT</b></td>
                                <td><b>Họ tên Chủ trọ</b></td>
                                <td><b>Địa chỉ</b></td>
                                <td><b>SL trống</b></td>
                                <td><b>Liên hệ</b></td>
                                <td><b>Vị trí</b></td>
                            </tr>';
        $bg = '#eeeeee';
        while ($row2 = pg_fetch_array($query, NULL, PGSQL_ASSOC)) {
            $bg = ($bg == '#eeeeee' ? '#ffffff' : '#eeeeee');
            echo '<tr bgcolor="' . $bg . '">
                                <td style="text-align: center">' . $i . '</td>
                                <td>' . $row2['hoten'] . '</td>
                                <td>' . $row2['address'] . '</td>
                                <td style="text-align: center">' . $row2['slphongtro'] . '</td>
                                <td>' . $row2['sdt'] . '</td>
                                <td>
                                    <button class="zoom" type="button" onclick="addmarker(' . $row2['lon'] . ',' . $row2['lat'] . ');">Zoom</button>
                                </td>
                            </tr>';
            $i++;
        }
        echo '</table>';
    } else {
        echo "<p style = 'margin-left: 30px; font-size: 13pt; padding:20px 20px 0;'><b>Không tìm thấy kết quả nào!</b></p>";
    }
} else if (empty($tieuchi) && empty($khuvuc)) {
}
