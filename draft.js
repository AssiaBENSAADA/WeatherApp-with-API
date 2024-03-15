const searchBtn = document.querySelector(".btn");
  
  async function apiweather() {
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;
  
    const reponse = await fetch(`https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min&latitude=${latitude}&longitude=${longitude}`);
    const data = await reponse.json();
    console.log(data);

    document.querySelector(".date").innerHTML = data.current.time.split("T")[0];
    document.querySelector(".minTemp").innerHTML = data.daily.temperature_2m_max[0] + data.current_units.temperature_2m;
    document.querySelector(".maxTemp").innerHTML = data.daily.temperature_2m_min[0] + data.current_units.temperature_2m;
    document.querySelector(".windSpeed").innerHTML = data.current.wind_speed_10m;
    document.querySelector(".windDirection").innerHTML = getWindDirectionIcon(data.current.wind_direction_10m);
    document.querySelector(".windGusts").innerHTML = data.current.wind_gusts_10m + data.current_units.wind_gusts_10m;  
  }
 

 

  searchBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    await apiweather();
  });
 
   