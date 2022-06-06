CREATE TABLE IF NOT EXISTS nmea (
    id serial PRIMARY KEY,
    gnss_type VARCHAR(2),
    nmea_type VARCHAR(3),
    nmea VARCHAR(85),
    time timestamptz
);