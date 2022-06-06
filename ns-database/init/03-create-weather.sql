CREATE TABLE IF NOT EXISTS weather (
    id serial PRIMARY KEY,
    humidity real,
    temperature real,
    pressure real,
    precipitation real,
    light real,
    time timestamptz
);