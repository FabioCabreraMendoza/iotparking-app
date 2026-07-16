INSERT INTO cajones (numero, estado)
SELECT n, 'disponible'::cajon_estado
FROM generate_series(1, 10) AS n
ON CONFLICT (numero) DO NOTHING;
