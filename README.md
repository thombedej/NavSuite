# NavSuite

## File Structure
### ns-frontend
Web application implemented using React.js. Visualizes liva and historical data using Chart.js and some custom methods. Offers data for download as .txt of .csv file. Replay data progressions using NMEA text file on local machine.

### ns-server
Backend server handling data collection, database communication, live data serving to the web app. Implemented using Node.js with
Fastify framework.

### ns-nginx
Reverse proxy implementation using NGINX.

### ns-database
container for database (not used currently, since database is deployed to a separate azure service).

## How to run
    docker-compose up --build
