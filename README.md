# Princess Connect Re:Dive resource version tracking and notification

Services that keep tracker new resource version and send the notification to another services using Kafka

This environment variable can be found at .env.example

# Data Initialization
Before using, It's required to create the profile manually in mongodb
```
{
  "name" : "<Profile Name>",
  "type" : "<API_CONNECTOR | GUESS_CONNECTOR>",
  "settings" : {
      "appId" : "<STORE APP ID>",
      "apis" : "<BASE APIS URL for Connector>",
      "serverCode" : "<Server Country Code>",
      "credential" : { // Credential for API_CONNECTOR
          "udid" : "<Device Unique Id>",
          "shortUdid" : <Short Device Unique Id>,
          "viewerId" : <Game ID>,
          "salt" : "<Salt for data hashing (Difference across the server)>"
      },
      "guessConfig" : { // guessConfig for GUESS_CONNECTOR
            "defaultResVersion" : "<Resource version to start guess>",
            "locale" : "<Server locale>"
        }
  }
}
```

# Endpoints
/v1/system/_health - Dummy Healthcheck
/v1/version - List all version


# Command

npm run build - Build the project
npm run start:watch - start dev and watch for changes
