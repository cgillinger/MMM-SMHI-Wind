/* MMM-SMHI-Wind.js
 * 
 * Magic Mirror Module for displaying wind data from SMHI API
 * 
 * Version 2.4.3
 * -----------------------------
 * v1.0 - Initial version with basic wind data display
 * v1.2 - Added correct wind direction mapping according to SMHI standard
 * v1.3 - Added support for both m/s and Beaufort scale with icons
 * v2.0 - Added complete icon support for wind speed and direction
 * v2.1 - Added iconOnly display mode 
 * v2.2 - Added "Beaufort" unit display in Beaufort mode
 * v2.2.1 - Added TextSea scale with nautical terms
 * v2.3 - Added language support (en/sv)
 * v2.4 - Moved translations to external files
 * v2.4.1 - Added custom CSS for colored wind arrows
 * v2.4.2 - Attempted horizontal layout (failed)
 * v2.4.3 - Simplified horizontal layout implementation
 */

Module.register("MMM-SMHI-Wind", {
    defaults: {
        lat: 57.7089,    // Göteborg latitude
        lon: 11.9746,    // Göteborg longitude
        updateInterval: 30 * 60 * 1000,
        animationSpeed: 1000,
        directionType: 'compass',
        displayType: 'textsea',
        iconOnly: false,
        language: 'en',
        layout: 'vertical'    // 'vertical' or 'horizontal'
    },

    getStyles: function() {
        return ["weather-icons.css", "font-awesome.css", "MMM-SMHI-Wind.css"];
    },

    getTranslations: function() {
        return {
            en: "translations/en.json",
            sv: "translations/sv.json"
        };
    },

    start: function() {
        Log.info("Starting module: " + this.name);
        this.loaded = false;
        this.windData = null;
        
        this.sendSocketNotification("GET_WIND_DATA", {
            lat: this.config.lat,
            lon: this.config.lon
        });

        setInterval(() => {
            this.sendSocketNotification("GET_WIND_DATA", {
                lat: this.config.lat,
                lon: this.config.lon
            });
        }, this.config.updateInterval);
    },

    getTextSea: function(speed) {
        if (speed >= 32.7) return this.translate("HURRICANE");
        if (speed >= 24.5) return this.translate("STORM");
        if (speed >= 13.9) return this.translate("GALE");
        if (speed >= 0.3) return this.translate("BREEZE");
        return this.translate("CALM");
    },

    getWindIcon: function(speed) {
        if (speed === 0) return 'wi-cloud';
        if (speed <= 0.2) return 'wi-cloud';
        if (speed <= 1.5) return 'wi-windy';
        if (speed <= 3.3) return 'wi-windy';
        if (speed <= 5.4) return 'wi-windy';
        if (speed <= 7.9) return 'wi-strong-wind';
        if (speed <= 10.7) return 'wi-strong-wind';
        if (speed <= 13.8) return 'wi-strong-wind';
        if (speed <= 17.1) return 'wi-gale-warning';
        if (speed <= 20.7) return 'wi-gale-warning';
        if (speed <= 24.4) return 'wi-gale-warning';
        if (speed <= 28.4) return 'wi-storm-warning';
        if (speed <= 32.6) return 'wi-storm-warning';
        return 'wi-hurricane-warning';
    },

    getDirectionIcon: function(degrees) {
        if (degrees === 0) return 'wi-na';
        
        const normalizedDegrees = ((degrees % 360) + 360) % 360;
        
        if (normalizedDegrees > 337.5 || normalizedDegrees <= 22.5) return 'wi-direction-down';
        if (normalizedDegrees <= 67.5) return 'wi-direction-down-left';
        if (normalizedDegrees <= 112.5) return 'wi-direction-left';
        if (normalizedDegrees <= 157.5) return 'wi-direction-up-left';
        if (normalizedDegrees <= 202.5) return 'wi-direction-up';
        if (normalizedDegrees <= 247.5) return 'wi-direction-up-right';
        if (normalizedDegrees <= 292.5) return 'wi-direction-right';
        if (normalizedDegrees <= 337.5) return 'wi-direction-down-right';
        
        return 'wi-na';
    },

    getDom: function() {
        const wrapper = document.createElement("div");
        wrapper.className = `small wind-${this.config.layout}`;  // Add layout class

        if (!this.loaded) {
            wrapper.innerHTML = this.translate("LOADING");
            return wrapper;
        }

        if (!this.windData) {
            wrapper.innerHTML = this.translate("ERROR");
            return wrapper;
        }

        // Wind Speed with icon
        const windSpeedDiv = document.createElement("div");
        windSpeedDiv.className = "wind-speed";
        let speedValue;
        switch(this.config.displayType) {
            case 'textsea':
                speedValue = this.getTextSea(this.windData.windSpeed);
                break;
            case 'beaufort':
                speedValue = this.getBeaufortForce(this.windData.windSpeed) + " " + this.translate("BEAUFORT");
                break;
            default: // 'ms'
                speedValue = this.windData.windSpeed + " " + this.translate("MS");
        }
        
        windSpeedDiv.innerHTML = `
            <i class="wi ${this.getWindIcon(this.windData.windSpeed)}"></i>
            ${this.config.iconOnly ? speedValue : this.translate("WIND_SPEED") + ": " + speedValue}
        `;
        
        // Wind Direction with icon
        const windDirDiv = document.createElement("div");
        windDirDiv.className = "wind-direction";
        const direction = this.getWindDirection(this.windData.windDirection);
        windDirDiv.innerHTML = `
            <i class="wi ${this.getDirectionIcon(this.windData.windDirection)}"></i>
            ${this.config.iconOnly ? direction : this.translate("WIND_DIRECTION") + ": " + direction}
        `;

        wrapper.appendChild(windSpeedDiv);
        wrapper.appendChild(windDirDiv);

        return wrapper;
    },

    getBeaufortForce: function(speed) {
        if (speed >= 32.7) return 12;
        if (speed >= 28.5) return 11;
        if (speed >= 24.5) return 10;
        if (speed >= 20.8) return 9;
        if (speed >= 17.2) return 8;
        if (speed >= 13.9) return 7;
        if (speed >= 10.8) return 6;
        if (speed >= 8.0) return 5;
        if (speed >= 5.5) return 4;
        if (speed >= 3.4) return 3;
        if (speed >= 1.6) return 2;
        if (speed >= 0.3) return 1;
        return 0;
    },

    getWindDirection: function(degrees) {
        if (degrees === 0) {
            return "N/A";
        }

        if (this.config.directionType === 'compass') {
            const normalizedDegrees = ((degrees % 360) + 360) % 360;
            
            if (normalizedDegrees > 337.5 || normalizedDegrees <= 22.5) {
                return "N";
            } else if (normalizedDegrees > 22.5 && normalizedDegrees <= 67.5) {
                return "NE";
            } else if (normalizedDegrees > 67.5 && normalizedDegrees <= 112.5) {
                return "E";
            } else if (normalizedDegrees > 112.5 && normalizedDegrees <= 157.5) {
                return "SE";
            } else if (normalizedDegrees > 157.5 && normalizedDegrees <= 202.5) {
                return "S";
            } else if (normalizedDegrees > 202.5 && normalizedDegrees <= 247.5) {
                return "SW";
            } else if (normalizedDegrees > 247.5 && normalizedDegrees <= 292.5) {
                return "W";
            } else if (normalizedDegrees > 292.5 && normalizedDegrees <= 337.5) {
                return "NW";
            }
        } else {
            return degrees + "°";
        }
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "WIND_DATA") {
            this.loaded = true;
            this.windData = payload;
            this.updateDom(this.config.animationSpeed);
        }
        if (notification === "WIND_DATA_ERROR") {
            this.loaded = true;
            this.windData = null;
            this.updateDom(this.config.animationSpeed);
        }
    }
});