import React, { useEffect, useState } from "react";
import Header from "../header/Header.jsx";
import "./CropPage.css";
import { TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { output_descriptions } from "./CropOutputs";
import LinearProgress from "@mui/material/LinearProgress";

// Focus on empty input fields
function focusEmptyFields() {
  const inputElements = [
    document.getElementById("nitrogen-crop-input"),
    document.getElementById("temp-crop-input"),
    document.getElementById("phosphorous-crop-input"),
    document.getElementById("humidity-crop-input"),
    document.getElementById("potassium-crop-input"),
    document.getElementById("ph-crop-input"),
    document.getElementById("rainfall-crop-input"),
  ];

  for (let i = 0; i < inputElements.length; i++) {
    if (inputElements[i].value === "") {
      inputElements[i].focus();
      return 0;
    }
  }
  return 1;
}

const CROP_ENDPOINT = "http://192.168.0.229:8080/crop_recommend";

export const crop_value_ranges = {
  nitrogen: [0, 150],
  phosphorous: [5, 145],
  potassium: [5, 205],
  temperature: [0, 50],
  humidity: [1, 100],
  ph: [3, 10],
  rainfall: [20, 300],
};

function handleClick(navigate) {
  const isFieldEmpty = focusEmptyFields();
  if (isFieldEmpty === 0) {
    console.log("Some Inputs are empty!");
    return;
  }

  const nitrogenValue = document.getElementById("nitrogen-crop-input").value;
  const tempValue = document.getElementById("temp-crop-input").value;
  const phosphorousValue = document.getElementById("phosphorous-crop-input").value;
  const humidityValue = document.getElementById("humidity-crop-input").value;
  const potassiumValue = document.getElementById("potassium-crop-input").value;
  const phValue = document.getElementById("ph-crop-input").value;
  const rainfallValue = document.getElementById("rainfall-crop-input").value;

  const min_temp = crop_value_ranges.temperature[0];
  const max_temp = crop_value_ranges.temperature[1];
  const min_humid = crop_value_ranges.humidity[0];
  const max_humid = crop_value_ranges.humidity[1];

  if (tempValue < min_temp || tempValue > max_temp) {
    window.alert("Temperature must be between 0-50 Celsius!");
    return;
  } else if (humidityValue < min_humid || humidityValue > max_humid) {
    window.alert("Humidity must be between 1-100!");
    return;
  }

  const progressBar = document.querySelector(".crop-progress-bar");
  progressBar.style.display = "block";
  progressBar.style.visibility = "visible";

  const data = {
    array: [
      parseFloat(nitrogenValue),
      parseFloat(phosphorousValue),
      parseFloat(potassiumValue),
      parseFloat(tempValue),
      parseFloat(humidityValue),
      parseFloat(phValue),
      parseFloat(rainfallValue),
    ],
  };

  fetch(CROP_ENDPOINT, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
      console.log(output_descriptions[data]);
      navigate("/crop_result", { state: { predicted_crop: data } });
    })
    .catch((error) => {
      console.error("Error:", error);
      window.alert("Some Error Occurred. Try again.");
    });
}

export function CropPage() {
  const navigate = useNavigate();
  const [loadingModel, setLoadingModel] = useState(true);  // State to track model loading

  useEffect(() => {
    const handleEnterPress = (event) => {
      if (event.key === "Enter") {
        handleClick(navigate);
      }
    };

    // Simulate model loading in the background (replace with actual model loading logic)
    setTimeout(() => {
      setLoadingModel(false);  // Set loading to false when model is loaded
    }, 3000); // Simulating a 3-second delay for model loading

    document.addEventListener("keydown", handleEnterPress);
    return () => {
      document.removeEventListener("keydown", handleEnterPress);
    };
  }, [navigate]);

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
            <div className="crop-container">
              <TextField
                id="nitrogen-crop-input"
                label="Ratio of Nitrogen"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
                }}
              />
              <TextField
                id="temp-crop-input"
                label="Temperature in Celsius"
                variant="outlined"
                color="success"
                type="number"
                fullWidth
                margin="normal"
                inputProps={{ min: 5, max: 50 }}
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
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
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
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
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
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
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
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
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
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
                sx={{
                  backgroundColor: "#0f0f0f", // Dark background
                  "& .MuiInputBase-root": {
                    color: "white", // White text inside the input
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // White border color
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "white", // Maintain white border on hover
                  },
                  "& .MuiInputLabel-root": {
                    color: "white", // White label text
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "white", // White placeholder text
                  },
                }}
              />
              <button
                className="predict_crop_btn"
                onClick={() => handleClick(navigate)}
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
