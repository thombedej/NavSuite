# NavSuite
http://nav-suite.azurewebsites.net


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
The app currently works with an external database hosted on azure PostgreSQL service. If you wish to use a local database, uncomment the following code block:

    # postgres-service:
    #   image: thombedej/ns-database
    #   build: ./ns-database
    #   container_name: ns-database
    #   restart: always
    #   # volumes:
    #   #   - initmount:/var/lib/postgresql/data/
    #   ports:
    #     - 5432:5432

Note: *initmount* needs to be rewritten to a local folder.
Building and running the entire app is done by:

    docker-compose up --build


## TODO:

### FRONT END
#### DASHBOARD
1. dashboard layout to a global state - app remembers your layout after page switch.
2. change data source on main config bar by dropdown (no need to go to settings).
3. additional stats on Status widget (e.g. difference from real value).
4. filter satellites by GNSS on Satellite Radar widget

#### GETDATA
1. display weather data (cloud when cloudy) directly above time axis. This way the user can specifically download data from stormy/cloudy/sunny periods.

### BACK END
1. security - uploading data using /sendGNSS service is limited to recognized devices
2. create periodic communication with a Weather API

### SYSTEM
1. find out the precise position of the GNSS station