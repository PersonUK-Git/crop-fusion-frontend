import React, { useEffect } from 'react';
import Header from '../header/Header';
import "./CropResult.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { output_descriptions, label_image_paths } from '../crop/CropOutputs';

export function CropResult() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state;

    useEffect(() => {
        if (locationState == null) {
            navigate("/crop");
        }
    }, [locationState, navigate]);

    if (locationState == null) {
        return null;
    }

    const predicted_crop = locationState["predicted_crop"];
    const output_image_path = label_image_paths[predicted_crop];

    return (
        <>
            <Header />
            <div className="crop-result-container">
                <p className="crop-result-p">
                    You should grow <b>{predicted_crop}</b> in your farm!
                </p>
                <img className="crop-result-img" src={output_image_path} alt={`${predicted_crop}`} />
                <p className="crop-result-description">
                    {output_descriptions[predicted_crop]}
                </p>
                <button className="crop-try-btn" onClick={() => navigate("/crop")}>
                    Try again?
                </button>
            </div>
        </>
    );
}
