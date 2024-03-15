const searchBtn = document.querySelector(".btn");
const container = document.querySelector(".container");
const containerDetails = document.querySelector(".ContainerDetails");

async function apiweather(latitude, longitude) {
  // const latitude = document.querySelector("#latitude").value;
  // const longitude = document.querySelector("#longitude").value;
  const reponse = await fetch(
    `https://api.open-meteo.com/v1/forecast?current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,,precipitation,wind_gusts_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&latitude=${latitude}&longitude=${longitude}`
  );
  const data = await reponse.json();
  console.log(data);
  //console.log("this is weather code", data.daily.weather_code);
  const cards = []; // Array to store card elements
  // Boucle sur les prévisions quotidiennes et les ajouter au conteneur
  for (let i = 0; i < 7; i++) {
    const card = document.createElement("div"); // Créez un nouvel élément div à chaque itération cela permettra d'éviter l'erreur "Uncaught (in promise) DOMException: Failed to execute 'append' on 'Element': The new child element contains the parent" quand j'utilise appendChild
    card.classList.add("card");
    //ajout des id à chaque tuile
    card.id = `card${i + 1}`; // Incrémente l'ID à chaque itération
    cards.push(card.id); // Add card to the array
    // Extraire le code météo de l'objet data.daily.weather_code[i]
    const weatherCode = data.daily.weather_code[i];

    // Appeler la fonction weatherCodeInterpretation avec le code météo extrait
    const weatherInfo = weatherCodeInterpretation(weatherCode);
    card.innerHTML = ` 
                <div class="date">${data.daily.time[i]}</div>
                <div>${weatherInfo.text}</div>
                <div>${weatherInfo.image}</div>;
                <div class=" temperatures">
                <div class="minTemp">${
                  data.daily.temperature_2m_min[i] +
                  data.current_units.temperature_2m
                }</div>
                <div class="maxTemp">${
                  data.daily.temperature_2m_max[i] +
                  data.current_units.temperature_2m
                }</div>
                </div>  
                <div class="windSpeed">${
                  data.daily.wind_speed_10m_max[i] +
                  data.daily_units.wind_speed_10m_max
                } </div>
                <div class="windDirection">${getWindDirectionIcon(
                  data.daily.wind_direction_10m_dominant[i]
                )}</div>
                <div class="windGusts">${
                  data.daily.wind_gusts_10m_max[i] +
                  data.daily_units.wind_gusts_10m_max
                }</div>
                `;
    container.appendChild(card);
    card.addEventListener("click", (event) => {
      event.preventDefault();
      showHourlyPrecipitation(data, i);
    });
  }
}

function showHourlyPrecipitation(data, dayIndex) {
  const hourlyPrecipitation = data.hourly.precipitation_probability;
  const hourlyPrecipitationper = data.hourly.precipitation;
  const hourlyTimes = data.hourly.time;
  const selectedDay = data.daily.time[dayIndex];

  const hourlyTemperature = data.hourly.temperature_2m;
  const hourlywindgust = data.hourly.wind_gusts_10m;
  // Filter hourly data for the selected day
  const selectedDayHourlyPrecipitation = hourlyPrecipitation.slice(
    dayIndex * 24,
    (dayIndex + 1) * 24
  );
  const selectedDayHourlyPrecipitationper = hourlyPrecipitationper.slice(
    dayIndex * 24,
    (dayIndex + 1) * 24
  );
  const selectedDayHourlywindgust = hourlywindgust.slice(
    dayIndex * 24,
    (dayIndex + 1) * 24
  );
  const selectedDayHourlyTemperature = hourlyTemperature.slice(
    dayIndex * 24,
    (dayIndex + 1) * 24
  );

  if (hourlyPrecipitation.length !== hourlyTimes.length) {
    console.error("Les tableaux n'ont pas la même longueur.");
    return;
  }
  console.log(hourlyTimes); // Log the hourly times to the console
  // Display only the selected day's hourly precipitation
  containerDetails.innerHTML = `
  <div class="cardDetails">
    <div class="hourText">Hourly infos for ${data.daily.time[dayIndex]}</div>
  ${hourlyTimes
    .map((timestamp, index) => {
      const hour = timestamp.slice(11, 13); // Displaying only HH from the timestamp
      const precipitationValue = selectedDayHourlyPrecipitation[index];
      const precipitationValueper = selectedDayHourlyPrecipitationper[index];
      const windgustHourlyValue = selectedDayHourlywindgust[index];
      const temperatureValue = selectedDayHourlyTemperature[index];
      // Check if the precipitation value is defined
      if (precipitationValue !== undefined) {
        return ` 
      <div class="group">  
      <div class="hourTemperature"> ${hour}h-${Math.round(temperatureValue)} ${
          data.current_units.temperature_2m
        } </div>
      <div class="precipitation">${precipitationValueper}% | ${precipitationValue} mm </div>
      
      
  <div class="windGustsDetails"> ${windgustHourlyValue} ${
          data.daily_units.wind_gusts_10m_max
        }</div> 
  
  <div class="trait">  </div>
  </div>
      `;
      } else {
        return ""; // Don't render anything if precipitationValue is undefined
      }
    })
    .join("")} 
`;
}
searchBtn.addEventListener("click", async (event) => {
  showLoading();
  //annuler le rechargement de la page lors d'un click
  event.preventDefault();
  containerDetails.innerHTML = "";
  const latitude = document.querySelector("#latitude").value;
  const longitude = document.querySelector("#longitude").value;

  // Suppression des tuiles précédentes à chaque clic
  container.innerHTML = " ";

  // Récupération des données de la fonction avec les nouvelles coordonnées
  await apiweather(latitude, longitude);
  hideLoading();
});
//Fonction d'interpretaion du code meteo
function weatherCodeInterpretation(weatherCode) {
  switch (weatherCode) {
    case 0:
      return {
        text: "Clear sky",
        image: "<img src='icones/clearsky.png' alt='Clear sky'>",
      };
    case 1:
    case 2:
    case 3:
      return {
        text: "Mainly clear, partly cloudy, and overcast",
        image:
          "<img src='icones/partlycloudy.png' alt='Mainly clear, partly cloudy, and overcast'>",
      };
    case 45:
    case 48:
      return {
        text: "Fog and depositing rime fog",
        image: "<img src='icones/fog.png' alt='Fog and depositing rime fog'>",
      };
    case 51:
    case 53:
    case 55:
      return {
        text: "Drizzle: Light, moderate, and dense intensity",
        image:
          "<img src='icones/drizzle.png' alt='Drizzle: Light, moderate, and dense intensity'>",
      };
    case 56:
    case 57:
      return {
        text: "Freezing Drizzle: Light and dense intensity",
        image:
          "<img src='icones/freezing_drizzle.png' alt='Freezing Drizzle: Light and dense intensity'>",
      };
    case 61:
    case 63:
    case 65:
      return {
        text: "Rain: Slight, moderate and heavy intensity",
        image:
          "<img src='icones/rain.png' alt='Rain: Slight, moderate and heavy intensity'>",
      };
    case 66:
    case 67:
      return {
        text: "Freezing Rain: Light and heavy intensity",
        image:
          "<img src='icones/freezingrain.png' alt='Freezing Rain: Light and heavy intensity'>",
      };
    case 71:
    case 73:
    case 75:
      return {
        text: "Snow fall: Slight, moderate, and heavy intensity",
        image:
          "<img src='icones/snowfall.png' alt='Snow fall: Slight, moderate, and heavy intensity'>",
      };
    case 77:
      return {
        text: "Snow grains",
        image: "<img src='icones/snowgrains.png' alt='Snow grains'>",
      };
    case 80:
    case 81:
    case 82:
      return {
        text: "Rain showers: Slight, moderate, and violent",
        image:
          "<img src='icones/heavyrain.png' alt='Rain showers: Slight, moderate, and violent'>",
      };
    case 85:
    case 86:
      return {
        text: "Snow showers slight and heavy",
        image:
          "<img src='icones/snowshowers.png' alt='Snow showers slight and heavy'>",
      };
    case 95:
      return {
        text: "Thunderstorm: Slight or moderate",
        image:
          "<img src='icones/thunderstorm.png' alt='Thunderstorm: Slight or moderate'>",
      };
    case 96:
    case 99:
      return {
        text: "Thunderstorm with slight and heavy hail",
        image:
          "<img src='icones/stormwithheavyrain.png' alt='Thunderstorm with slight and heavy hail'>",
      };
    default:
      return "Unknown weather code";
  }
}

// Fonction pour obtenir le chemin de l'icône en fonction de la direction du vent (en degrés)
function getWindDirectionIcon(degrees) {
  //Ajout des plages de degrés et les associer à des chemins d'icônes
  if (degrees > 0 && degrees < 45) {
    return `<img src="icones/north.png" alt ="icon">`;
  } else if (degrees >= 45 && degrees < 90) {
    return `<img src="icones/north_east.png" alt ="icon">`;
  } else if (degrees >= 90 && degrees < 135) {
    return `<img src="icones/east.png" alt ="icon">`;
  } else if (degrees >= 135 && degrees < 180) {
    return `<img src="icones/south_east.png" alt ="icon">`;
  } else if (degrees >= 180 && degrees < 225) {
    return `<img src="icones/south.png" alt ="icon">`;
  } else if (degrees >= 225 && degrees < 270) {
    return `<img src="icones/south_west.png" alt ="icon">`;
  } else if (degrees >= 270 || degrees < 315) {
    return `<img src="icones/west.png" alt ="icon">`;
  } else if (degrees >= 315 && degrees <= 360) {
    return `<img src="icones/north_west.png" alt ="icon">`;
  }
}
// Get a reference to the weatherCards element
const weatherCards = document.getElementById("weatherCards");

// Function to display the loading message
function showLoading() {
  weatherCards.style.display = "block";
}

// Function to hide the loading message and display the result
function hideLoading() {
  weatherCards.style.display = "none";
}
