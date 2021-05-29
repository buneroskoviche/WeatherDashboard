const $searchBtn = $("#searchBtn");
const $searchText = $("#searchText");
const $searchCol = $("#searchesColumn");
const $searchHistory = $("#searchHistory");
const $cityName = $("#cityName");
const api = config.APIkey;
const historyArray =[];

// This function creates a button to place under the search area based on a string
createBtn = (string) => {
    const cityBtn = $("<button>").addClass(`btn btn-secondary my-2`).attr('id', string).text(string);
    $searchHistory.prepend(cityBtn);
    $searchText.val('');
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
                return [latitude, longitude];
            } else {
                $cityName.text("Could not find the city")
                return;
            }
        })
        .then(function (latLon) {
            if (latLon) {
                const locationUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${latLon[0]}&lon=${latLon[1]}&exclude=minutely,hourly,alerts&units=imperial&appid=${api}`
                fetch(locationUrl)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    displayWeather(data);
                })
            }
        })
}

// This function displays the fetched weather forecast
displayWeather = (object) => {
    console.log(object);
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
    getWeather(input.replace(" ", "+"));
});

$searchHistory.on('click', function(event) {
    const element = event.target;
    if (element.matches("button")) {
        const btnId = element.getAttribute('id');
        getWeather(btnId.replace(" ", "+"));
    }
});