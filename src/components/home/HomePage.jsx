import Header from "../header/Header.jsx";
import Background3D from "../3dmodel/Model.jsx";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useState, useEffect } from "react";
import { HashLoader } from "react-spinners";
import Container from '@mui/material/Container';

const model_path = 'Model/scene.gltf';

function HomePage(props) {
    const navigate = useNavigate();

    return (
        <>
            <Header />
            <Container className="home-container">
                <p className="question">What Crop to Grow This Season?</p>
                <p className="description">
                    Welcome to CropFusionAI, where we put the "AI" in "farming".
                    We help farmers make tough decisions, like whether to plant corn or lettuce this season. 
                    Our advanced machine learning models have got you covered. 
                    Start using CropFusionAI today and let the robots handle the dirty work!
                </p>
                <button className="start_btn" onClick={() => navigate("/crop")}>GET STARTED</button>
                <div className="container">
                    {props.children}
                </div>
            </Container>
        </>
    );
}

export function ModelLoader() {
    const [isLoading, setIsLoading] = useState(true);
    const [bg, setBg] = useState(null);

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(model_path, (model) => {
            const bg = () => {
                return (
                    <>
                        <HomePage>
                            <Background3D model={model} />
                        </HomePage>
                    </>
                );
            }
            setBg(bg);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) {
        return (
            <div>
                <Header />
                <Container maxWidth="md">
                    <HashLoader
                        className="spinner"
                        color={"#0C9463"}
                        loading={true}
                        cssOverride={{ display: "block", margin: "0 auto", marginTop: "18 %" }}  // Spinner's CSS
                        size={80}
                        aria-label="Loading..."
                        data-testid="loader"
                    />
                </Container>
            </div>
        );
    }

    return (
        <>
            {bg}
        </>
    );
}

export default HomePage;