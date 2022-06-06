CREATE TABLE IF NOT EXISTS navdata (
    id serial PRIMARY KEY,
    gnss_type VARCHAR(2),
    lat real,
    lon real,
    alt real,
    vdop real,
    pdop real,
    hdop real,
    speed real,
    time timestamptz
);