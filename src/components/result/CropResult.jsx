import React, { useEffect, useState } from 'react';
import Header from '../header/Header';
import "./CropResult.css";
import { useNavigate, useLocation } from 'react-router-dom';
import { output_descriptions, label_image_paths } from '../crop/CropOutputs';
import { GoogleGenerativeAI } from '@google/generative-ai';

export function CropResult() {

    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state;

    // State to store result from Gemini API
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(true); // State for loading
    const [error, setError] = useState(null); // State for error

    console.log("LOCATION : ", location)
    console.log("LOCATION STATE : ", locationState)

    // Runs at initial render. Redirects if State is null.
    useEffect(() => {
        if (locationState == null) {
            console.log("Redirecting to /crop...");
            navigate("/crop");
        }
    }, [locationState, navigate]);

    if (locationState == null) {
        console.log("LocationState is null");
        return null;
    }

    const predicted_crop = locationState["predicted_crop"];
    const output_image_path = label_image_paths[predicted_crop];
    console.log('Image Path : ', output_image_path);

    // Fetch data from Gemini API
    const fetchGeminiData = async () => {
        try {
            const genAI = new GoogleGenerativeAI("AIzaSyAb8Rp5AoqpDkioj_f1hbop2tQGP5eUVc4");
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-thinking-exp-01-21" });

            const prompt = `Write the thing in a 3 or 4 lines about a fact and average price of that crop in INR  ${predicted_crop}. And , also suggest Which crop is best to grow in next rotation`;

            const result = await model.generateContent(prompt);

            // Update the state with the generated content
            setGeneratedContent(result.response.text());
            setLoading(false); // Set loading to false when data is fetched
        } catch (err) {
            // setError('Error fetching data from Gemini API');
            setLoading(false);
        }
    };

    useEffect(() => {
        // Call the API when the component mounts
        fetchGeminiData();
    }, [predicted_crop]); // Re-run when predicted_crop changes

    // If still loading, show a loading message
    if (loading) {
        return <div>Loading...</div>;
    }

    // If there's an error, show an error message
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="crop-result-container">
            <Header />
            <p className="crop-result-p"> You should grow <b>{predicted_crop}</b> in your farm !</p>
            <img className="crop-result-img" src={output_image_path} alt={predicted_crop} />
            <p className="crop-result-description">{output_descriptions[predicted_crop]}</p>

            {/* Render the generated content from Gemini */}
            <div className="crop-result-container">
                <h3>Another Thing to Know</h3>
                <p className='crop-result-description'>{generatedContent || "Gemini servers are out of reach(429: Too Many Requests)"}</p>
            </div>

            <button className="crop-try-btn" onClick={() => navigate("/crop")}>Try again?</button>
        </div>
    );
}
