import { useNavigate } from "react-router-dom";
import { useHomePage } from "../hooks/useHomePage";
import ForecastForm from "../components/home/ForecastForm";
import ForecastResult from "../components/home/ForecastResult";
import ForecastGptResult from "../components/home/ForecastGptResult";
import NotOnVolgaWarning from "../components/home/NotOnVolgaWarning";
import MyFishings from "../components/home/MyFishings";
import HomePageHeader from "../components/home/HomePageHeader";

export default function Home() {
  const navigate = useNavigate();
  const home = useHomePage(navigate);

  return (
    <div>
      <HomePageHeader />
      <ForecastForm
        form={home.form}
        fishList={home.fishList}
        coords={home.coords}
        setCoords={home.setCoords}
        handleChange={home.handleChange}
        handleForecast={home.handleForecast}
        resetCoords={home.resetCoords}
      />
      {home.forecast && home.forecast.onVolga === false && <NotOnVolgaWarning />}
      {home.forecast && <ForecastResult forecast={home.forecast} />}
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
