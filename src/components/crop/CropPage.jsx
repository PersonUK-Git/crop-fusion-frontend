import React, { useEffect, useState } from "react";
import Header from "../header/Header.jsx";
import "./CropPage.css";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { output_descriptions } from "./CropOutputs";
import LinearProgress from "@mui/material/LinearProgress";

const CROP_ENDPOINT = "http://192.168.1.69:8080/crop_recommend";

export const crop_value_ranges = {
  nitrogen: [0, 150],
  phosphorous: [5, 145],
  potassium: [5, 205],
  temperature: [0, 50],
  humidity: [1, 100],
  ph: [3, 10],
  rainfall: [20, 300],
};

export function CropPage() {
  const navigate = useNavigate();
  const [loadingModel, setLoadingModel] = useState(true);
  const [locationAccess, setLocationAccess] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [fieldsFilled, setFieldsFilled] = useState(false);
  
  const [formData, setFormData] = useState({
    nitrogen: '',
    temperature: '',
    phosphorous: '',
    humidity: '',
    potassium: '',
    ph: '',
    rainfall: ''
  });

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=4a06981364cbc36659a49490364cb289&units=metric`
      );
      if (!response.ok) {
        throw new Error("Weather data not available");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching weather data:", error);
      setLocationError("Weather data unavailable. Please enter manually.");
      return null;
    }
  };

  const fillWeatherFields = (weather) => {
    if (!weather || !weather.main) return;

    setFormData(prev => ({
      ...prev,
      temperature: weather.main.temp.toFixed(1),
      humidity: weather.main.humidity.toString(),
      rainfall: weather.rain?.["1h"]?.toFixed(1) || "50"
    }));

    setFieldsFilled(true);
  };

  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLocationAccess(true);
          const { latitude, longitude } = position.coords;
          const weather = await fetchWeatherData(latitude, longitude);
          console.log("Weather data:", weather);
          if (weather) {
            fillWeatherFields(weather);
          }
        },
        (error) => {
          setLocationError("Location access denied. Please enter data manually.");
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id.replace('-crop-input', '')]: value
    }));
  };

  const handleClick = () => {
    // Validate required fields
    const requiredFields = ['nitrogen', 'temperature', 'phosphorous', 'humidity', 'potassium', 'ph', 'rainfall'];
    const emptyField = requiredFields.find(field => !formData[field]);
    
    if (emptyField) {
      const fieldId = `${emptyField}-crop-input`;
      document.getElementById(fieldId)?.focus();
      console.log("Some inputs are empty!");
      return;
    }

    // Validate ranges
    const { temperature, humidity } = formData;
    if (temperature < crop_value_ranges.temperature[0] || temperature > crop_value_ranges.temperature[1]) {
      window.alert("Temperature must be between 0-50 Celsius!");
      return;
    }
    if (humidity < crop_value_ranges.humidity[0] || humidity > crop_value_ranges.humidity[1]) {
      window.alert("Humidity must be between 1-100!");
      return;
    }

    // Show loading
    const progressBar = document.querySelector(".crop-progress-bar");
    progressBar.style.display = "block";
    progressBar.style.visibility = "visible";

    // Prepare data
    const data = {
      array: [
        parseFloat(formData.nitrogen),
        parseFloat(formData.phosphorous),
        parseFloat(formData.potassium),
        parseFloat(formData.temperature),
        parseFloat(formData.humidity),
        parseFloat(formData.ph),
        parseFloat(formData.rainfall),
      ],
    };

    // Submit
    fetch(CROP_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        navigate("/crop_result", { state: { predicted_crop: data } });
      })
      .catch((error) => {
        console.error("Error:", error);
        window.alert("Some Error Occurred. Try again.");
      });
  };

  const handleTryAgain = () => {
    setLocationError(null);
    requestLocationAccess();
  };

  const clearWeatherData = () => {
    setFormData(prev => ({
      ...prev,
      temperature: '',
      humidity: '',
      rainfall: ''
    }));
    setFieldsFilled(false);
  };

  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        handleClick();
      }
    };

    requestLocationAccess();

    const loadTimer = setTimeout(() => {
      setLoadingModel(false);
    }, 3000);

    document.addEventListener("keydown", handleEnterPress);
    return () => {
      clearTimeout(loadTimer);
      document.removeEventListener("keydown", handleEnterPress);
    };
  }, []);

  return (
    <>
      <Header />
      <div className="background-wrapper">
        <LinearProgress
          style={{ visibility: loadingModel ? "visible" : "hidden", display: loadingModel ? "block" : "none" }}
          className="crop-progress-bar"
          color="success"
        />
        {loadingModel ? (
          <p className="loading-model-loader">Loading model, please wait...</p>
        ) : (
          <>
            <p className="crop-p">
              Enter soil characteristics to find the best <b>CROP</b> to grow on your farm 👩‍🌾🌽🚜
            </p>
            
            {!locationAccess && !locationError && (
              <div className="location-permission">
                <p>We can automatically fill weather data if you allow location access.</p>
                <button onClick={requestLocationAccess}>Allow Location Access</button>
              </div>
            )}
            
            {locationError && (
              <div className="location-error">
                <p>{locationError}</p>
                <button onClick={handleTryAgain}>Try Again</button>
              </div>
            )}
            
            {fieldsFilled && (
              <div className="location-success">
                <p>Weather data has been automatically filled!</p>
                <button className="clear-weather-btn" onClick={clearWeatherData}>
                  Clear Weather Data
                </button>
              </div>
            )}

            <div className="crop-container">
              <TextField
                id="nitrogen-crop-input"
                label="Ratio of Nitrogen"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.nitrogen}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="temperature-crop-input"
                label="Temperature in Celsius"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.temperature}
                onChange={handleInputChange}
                inputProps={{ min: 5, max: 50 }}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="phosphorous-crop-input"
                label="Ratio of Phosphorous"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.phosphorous}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="humidity-crop-input"
                label="% of Humidity"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.humidity}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="potassium-crop-input"
                label="Ratio of Potassium"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.potassium}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="ph-crop-input"
                label="PH Level of soil"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.ph}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <TextField
                id="rainfall-crop-input"
                label="Rainfall in Millimeter (mm)"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                value={formData.rainfall}
                onChange={handleInputChange}
                sx={{
                  backgroundColor: "#0f0f0f",
                  "& .MuiInputBase-root": { color: "white" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "white" },
                  "& .MuiInputLabel-root": { color: "white" },
                  "& .MuiInputBase-input::placeholder": { color: "white" },
                }}
              />
              <button
                className="predict_crop_btn"
                onClick={handleClick}
              >
                PREDICT
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CropPage;