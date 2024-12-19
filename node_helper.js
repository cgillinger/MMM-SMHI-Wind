const NodeHelper = require("node_helper");
const fetch = require("node-fetch");

module.exports = NodeHelper.create({
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    getWindData: async function(config) {
        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${config.lon}/lat/${config.lat}/data.json`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            // Get current time data
            const currentData = this.getCurrentTimeData(data.timeSeries);
            
            // Extract wind data
            const windData = {
                windSpeed: this.findParameterValue(currentData, "ws"),
                windDirection: this.findParameterValue(currentData, "wd")
            };
            
            // Log wind data for debugging
            console.log("SMHI Wind Data:");
            console.log("Wind Speed:", windData.windSpeed, "m/s");
            console.log("Wind Direction:", windData.windDirection, "degrees");
            
            this.sendSocketNotification("WIND_DATA", windData);
        } catch (error) {
            console.error("Error fetching wind data:", error);
            this.sendSocketNotification("WIND_DATA_ERROR");
        }
    },

    getCurrentTimeData: function(timeSeries) {
        const now = new Date();
        return timeSeries.reduce((closest, current) => {
            const currentTime = new Date(current.validTime);
            const closestTime = new Date(closest.validTime);
            
            return Math.abs(currentTime - now) < Math.abs(closestTime - now) 
                ? current 
                : closest;
        });
    },

    findParameterValue: function(data, parameterName) {
        const parameter = data.parameters.find(p => p.name === parameterName);
        return parameter ? parameter.values[0] : null;
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_WIND_DATA") {
            this.getWindData(payload);
        }
    }
});