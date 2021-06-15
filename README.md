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

SELECT DISTINCT ON (tr.mant) us.hoten, us.sdt, CONCAT(tr.sonha,' ',d.tenduong,', ',xp.tenpx) as address, tn.tentn, lnt.tenlnt, tr.dientich, tr.songuoio, tr.nhavesinh, tr.giaphong, tr.tiencoc, tr.tiendien, tr.tiennuoc, tr.giogiac, tr.slphongtro, ti.tentr,
        ST_X(ST_Centroid(tr.geom)) AS lon, ST_Y(ST_Centroid(tr.geom)) AS lat
FROM public.nhatro tr
            LEFT JOIN public.truong ti ON ST_DWithin(tr.geom::geography, ti.geom::geography, 400)
            INNER JOIN public.user us ON tr.id = us.id
            INNER JOIN public.duong d ON tr.maduong = d.maduong
            INNER JOIN public.tiennghi tn ON tr.matn = tn.matn 
            INNER JOIN public.loainhatro lnt ON tr.malnt = lnt.malnt 
            INNER JOIN public.xaphuong xp ON tr.maphuongxa = xp.mapx
WHERE tr.maphuongxa = 'PX023';