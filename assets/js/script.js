const $searchBtn = $("#searchBtn");
const $searchText = $("#searchText");
const $searchCol = $("#searchesColumn");
const $searchHistory = $("#searchHistory");
const $forecast = $("#forecast");
const $cityName = $("#cityName");
const $temperature = $("#temp");
const $wind = $("#wind");
const $humidity = $("#humidity");
const $uv = $("#UV");
const api = config.APIkey;
const historyArray =[];

// This function creates a button to place under the search area based on a string
createBtn = (string) => {
    const cityBtn = $("<button>").addClass(`btn btn-secondary my-2`).attr('id', string).text(string);
    $searchHistory.prepend(cityBtn);
}

// This function gets the city coordinates on the first fetch, then the forecast on the second
getWeather = (string) => {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${string}&appid=${api}`
    fetch(apiUrl)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            if (data.cod === 200) {
                const latitude = data.coord.lat;
                const longitude = data.coord.lon;
                const name = data.name;
                return [name, latitude, longitude];
            } else {
                $cityName.text("Could not find the city");
                return;
            }
        })
        .then(function (latLon) {
            if (latLon) {
                const locationUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[1]}&lon=${latLon[2]}&exclude=minutely,hourly,alerts&units=imperial&appid=${api}`
                fetch(locationUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    displayWeather(latLon[0], data);
                })
            }
        })
}

// This function displays the fetched 5-day weather forecast
displayWeather = (str, obj) => {
    // Removes the old weather cards
    $forecast.children().remove();
    // Changes the text for the weather of the day
    $cityName.text(`${str} ${moment(obj.daily[0].dt, "X").format("M/D/YYYY")}`);
    $temperature.text(`${obj.daily[0].temp.day}°F`);
    $wind.text(`${obj.daily[0].wind_speed} MPH`);
    $humidity.text(`${obj.daily[0].humidity}%`);
    $uv.text(obj.daily[0].uvi);
    // Checks the severity of the UV index, and chooses a color
    if (obj.daily[0].uvi < 3) {
        $uv.css("background-color", "green");
    } else if (obj.daily[0].uvi >= 3 && obj.daily[0].uvi < 6) {
        $uv.css("background-color", "orange");
    } else if (obj.daily[0].uvi > 6) {
        $uv.css("background-color", "red");
    }
    // Creates 5 weather cards
    for (let i = 1; i < 6; i++) {
        const $card = $("<div>").addClass("weatherCard bg-primary m-3");
        const date = $("<h3>").text(moment(obj.daily[i].dt, "X").format("M/D/YYYY")).addClass("ms-2 text-white");
        const image = $("<img>").attr("src", `http://openweathermap.org/img/wn/${obj.daily[i].weather[0].icon}@2x.png`);
        const temp = $("<li>").text(`Temp: ${obj.daily[i].temp.day}°F`).addClass("list-group-item");
        const wind = $("<li>").text(`Wind: ${obj.daily[i].wind_speed} MPH`).addClass("list-group-item");
        const humid = $("<li>").text(`Humidity: ${obj.daily[i].humidity}%`).addClass("list-group-item");
        const details = $("<ul>").addClass("list-group list-group-flush").append(temp).append(wind).append(humid);
        $card.append(date).append(image).append(details);
        $forecast.append($card);
    }
}

// Pull the history from local storage, and create a button for each stored value
const historyStorage = JSON.parse(localStorage.getItem('history'));
if (historyStorage) {
    for (let i = 0; i < historyStorage.length; i++) {
        historyArray.push(historyStorage[i]);
        createBtn(historyArray[i]);
    }
}

// Function of the search button
$searchBtn.on('click', function(event) {
    event.preventDefault();
    const input = $searchText.val().trim();
    // If nothing was entered, end the function
    if(!input) {
        $cityName.text("Please enter a city name");
        return;
    }
    // Save the text input to local storage
    historyArray.push(input);
    // If the array has more than 10 entries, remove the oldest entry and button
    if (historyArray.length > 10) {
        historyArray.shift();
        $searchHistory.children().last().remove();
    }
    localStorage.setItem('history', JSON.stringify(historyArray));
    // Create a button based on the text input
    createBtn(input);
    $searchText.val('');
    getWeather(input.replace(" ", "+"));
});

// This adds a click listener to the search history buttons
$searchHistory.on('click', function(event) {
    const element = event.target;
    if (element.matches("button")) {
        const btnId = element.getAttribute('id');
        getWeather(btnId.replace(" ", "+"));
    }
});