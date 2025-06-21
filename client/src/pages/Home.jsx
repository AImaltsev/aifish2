import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useHomePage } from "../hooks/useHomePage";
import ForecastForm from "../components/home/ForecastForm";
import ForecastProgressBar from "../components/home/ForecastProgressBar";
import ForecastResult from "../components/home/ForecastResult";
import ForecastGptResult from "../components/home/ForecastGptResult";
import NotOnVolgaWarning from "../components/home/NotOnVolgaWarning";
import MyFishings from "../components/home/MyFishings";
import HomePageHeader from "../components/home/HomePageHeader";

export default function Home() {
  const navigate = useNavigate();
  const home = useHomePage(navigate);

  const [showProgressBar, setShowProgressBar] = useState(false);
  const [progressComplete, setProgressComplete] = useState(false);

  const handleForecastButton = (e) => {
    e.preventDefault();
    setShowProgressBar(true);
    setProgressComplete(false);
  };

  return (
    <div>
      <HomePageHeader />
      <ForecastForm
        form={home.form}
        fishList={home.fishList}
        coords={home.coords}
        setCoords={home.setCoords}
        handleChange={home.handleChange}
        handleForecastButton={handleForecastButton}
        resetCoords={home.resetCoords}
      />
      {showProgressBar && !progressComplete && (
        <ForecastProgressBar onComplete={async () => {
          await home.handleForecast();
          setProgressComplete(true);
          setShowProgressBar(false);
        }} />
      )}
      {progressComplete && home.forecast && home.forecast.onVolga === false && <NotOnVolgaWarning />}
      {progressComplete && home.forecast && <ForecastResult forecast={home.forecast} />}
      <ForecastGptResult
        forecastGpt={home.forecastGpt}
        loading={home.forecastGptLoading}
        error={home.forecastGptError}
      />
      {home.forecastError && <div style={{ color: "red", marginBottom: 20 }}>{home.forecastError}</div>}
      <button onClick={() => navigate("/add")}>Добавить рыбалку</button>
      <MyFishings fishings={home.fishings} />
    </div>
  );
}
