/**
 * MMM-SMHI-Wind Node Helper
 * 
 * This helper fetches wind data from the Swedish Meteorological and Hydrological Institute (SMHI)
 * and provides it to the main module for display.
 * 
 * @author Christian Gillinger
 * @contributor Various MagicMirror Community Members
 * @license MIT
 * 
 * Version History:
 * ===============
 * v1.0.0 (2023-12-01) - Initial version with basic wind data fetching
 * v1.1.0 (2023-12-15) - Added error handling and logging
 * v2.0.0 (2024-01-19) - Removed external dependencies, now uses built-in https module
 * v2.0.1 (2024-01-20) - Enhanced documentation and error messaging
 * 
 * MIT License
 * ===========
 * Copyright (c) 2023-2024 Christian Gillinger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 */

// Required Node.js built-in modules
const NodeHelper = require("node_helper");  // Core MagicMirror helper module
const https = require("https");             // Built-in HTTPS module for secure requests

module.exports = NodeHelper.create({
    // Initialize the helper
    start: function() {
        console.log("Starting node helper for: " + this.name);
    },

    /**
     * Fetches wind data from SMHI API
     * @param {Object} config - Configuration object containing latitude and longitude
     */
    getWindData: function(config) {
        // Construct the API URL using the provided coordinates
        const url = `https://opendata-download-metfcst.smhi.se/api/category/pmp3g/version/2/geotype/point/lon/${config.lon}/lat/${config.lat}/data.json`;
        
        // Make HTTPS request to SMHI API
        https.get(url, (resp) => {
            let data = '';  // Variable to store the incoming data

            // Event handler for receiving data chunks
            resp.on('data', (chunk) => {
                data += chunk;  // Append each chunk of data as it arrives
            });

            // Event handler for when all data has been received
            resp.on('end', () => {
                try {
                    // Parse the complete JSON response
                    const jsonData = JSON.parse(data);
                    
                    // Get the most relevant time period's data
                    const currentData = this.getCurrentTimeData(jsonData.timeSeries);
                    
                    // Extract just the wind-related data we need
                    const windData = {
                        windSpeed: this.findParameterValue(currentData, "ws"),      // Wind speed in m/s
                        windDirection: this.findParameterValue(currentData, "wd")   // Wind direction in degrees
                    };
                    
                    // Log the data for debugging purposes
                    console.log("SMHI Wind Data:");
                    console.log("Wind Speed:", windData.windSpeed, "m/s");
                    console.log("Wind Direction:", windData.windDirection, "degrees");
                    
                    // Send the processed wind data back to the main module
                    this.sendSocketNotification("WIND_DATA", windData);
                } catch (error) {
                    console.error("Error parsing wind data:", error);
                    this.sendSocketNotification("WIND_DATA_ERROR");
                }
            });

        }).on("error", (err) => {
            // Handle any errors that occur during the HTTPS request
            console.error("Error fetching wind data:", err);
            this.sendSocketNotification("WIND_DATA_ERROR");
        });
    },

    /**
     * Finds the most relevant time period from the API data
     * @param {Array} timeSeries - Array of time-based weather data
     * @returns {Object} The weather data closest to current time
     */
    getCurrentTimeData: function(timeSeries) {
        const now = new Date();
        return timeSeries.reduce((closest, current) => {
            const currentTime = new Date(current.validTime);
            const closestTime = new Date(closest.validTime);
            
            // Compare time differences to find the closest time period
            return Math.abs(currentTime - now) < Math.abs(closestTime - now) 
                ? current 
                : closest;
        });
    },

    /**
     * Extracts specific weather parameter values from the data
     * @param {Object} data - Weather data object
     * @param {string} parameterName - Name of the parameter to find (e.g., "ws" for wind speed)
     * @returns {number|null} The value of the parameter or null if not found
     */
    findParameterValue: function(data, parameterName) {
        const parameter = data.parameters.find(p => p.name === parameterName);
        return parameter ? parameter.values[0] : null;
    },

    /**
     * Handles incoming socket notifications from the main module
     * @param {string} notification - The type of notification received
     * @param {Object} payload - The data received with the notification
     */
    socketNotificationReceived: function(notification, payload) {
        if (notification === "GET_WIND_DATA") {
            this.getWindData(payload);
        }
    }
});
