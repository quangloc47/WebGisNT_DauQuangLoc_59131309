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

