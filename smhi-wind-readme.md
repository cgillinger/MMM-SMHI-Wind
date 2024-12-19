Work in progress, not ready for deployment

# MMM-SMHI-Wind

A MagicMirror² module that displays wind data from the Swedish Meteorological and Hydrological Institute (SMHI) API. This module shows current wind conditions with customizable displays including wind speed, direction, and descriptive icons.

## Key Features

- **Zero Dependencies**: Works right out of the box with your MagicMirror² installation
- **Real-time Wind Data**: Direct from SMHI's official API
- **Multiple Display Formats**:
  - Wind speed in meters per second (m/s)
  - Beaufort scale (0-12)
  - Nautical terms (e.g., "Breeze", "Gale", "Storm")
- **Flexible Direction Display**:
  - Compass points (N, NE, E, etc.)
  - Degrees (0-359°)
- **Visual Elements**:
  - Dynamic weather icons
  - Directional arrows
  - Vertical or horizontal layout
- **Multilingual**: English and Swedish support

## Simple Installation

1. Just clone into your MagicMirror's modules directory:
```bash
cd ~/MagicMirror/modules
git clone https://github.com/yourusername/MMM-SMHI-Wind.git
```

2. Add to your `config.js`:
```javascript
{
    module: "MMM-SMHI-Wind",
    position: "top_right",
    config: {
        lat: 57.7089,    // Your latitude
        lon: 11.9746     // Your longitude
    }
}
```

That's it! No additional installation steps needed.

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `lat` | Latitude of your location | `57.7089` |
| `lon` | Longitude of your location | `11.9746` |
| `updateInterval` | How often to fetch new data (milliseconds) | `1800000` (30 minutes) |
| `animationSpeed` | Speed of UI updates (milliseconds) | `1000` |
| `directionType` | Wind direction format (`"compass"` or `"degrees"`) | `"compass"` |
| `displayType` | Wind speed format (`"ms"`, `"beaufort"`, or `"textsea"`) | `"textsea"` |
| `iconOnly` | Show only icons without text | `false` |
| `language` | Display language (`"en"` or `"sv"`) | `"en"` |
| `layout` | Module layout (`"vertical"` or `"horizontal"`) | `"vertical"` |

### Example Configurations

#### Minimal (Just the basics)
```javascript
{
    module: "MMM-SMHI-Wind",
    position: "top_right",
    config: {
        lat: 57.7089,
        lon: 11.9746
    }
}
```

#### Full Featured
```javascript
{
    module: "MMM-SMHI-Wind",
    position: "top_right",
    config: {
        lat: 57.7089,
        lon: 11.9746,
        updateInterval: 900000,     // Update every 15 minutes
        displayType: "textsea",     // Use nautical terms
        directionType: "compass",   // Show N, NE, E, etc.
        iconOnly: false,            // Show both icons and text
        language: "en",             // English language
        layout: "horizontal"        // Horizontal layout
    }
}
```

## Updating

1. Navigate to the module folder:
```bash
cd ~/MagicMirror/modules/MMM-SMHI-Wind
```

2. Pull the latest version:
```bash
git pull
```

3. Restart your MagicMirror²

## Troubleshooting

1. **No data showing**: Check your latitude/longitude values
2. **Wrong direction**: Make sure you're using decimal degrees (e.g., 57.7089, not 57°42'32"N)
3. **Module not loading**: Check MagicMirror's logs for any error messages

## Contributing

Feel free to submit issues and enhancement requests! 

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Acknowledgments

- Weather icons from Erik Flowers' [Weather Icons](https://erikflowers.github.io/weather-icons/)
- Data provided by Swedish Meteorological and Hydrological Institute (SMHI)