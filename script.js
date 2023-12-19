// Use the API_URL variable to make fetch requests to the API.
// Replace the placeholder with your cohort name (ex: 2109-UNF-HY-WEB-PT)
const cohortName = "2311-fsa-et-web-ft-sf";
const API_URL = `https://fsa-puppy-bowl.herokuapp.com/api/${cohortName}`;
const main = document.getElementById("main");
const newPlayerForm = document.getElementById("new-player-form");

/**
 * Fetches all players from the API.
 * @returns {Object[]} the array of player objects
 */
const fetchAllPlayers = async () => {
  try {
    const players = await fetch(`${API_URL}/players`)
    const playersJSON = await players.json()
    const playersData = await playersJSON.data
    const playersList = playersData.players
    return playersList
  } catch (err) {
    console.error("Uh oh, trouble fetching players!", err);
  }
};

/**
 * Fetches a single player from the API.
 * @param {number} playerId
 * @returns {Object} the player object
 */
const fetchSinglePlayer = async (playerId) => {
  try {
    let response = await fetch(`${API_URL}/players/${playerId}`)
    let player = await response.json()
    return player
  } catch (err) {
    console.error(`Oh no, trouble fetching player #${playerId}!`, err);
  }
};

/**
 * Adds a new player to the roster via the API.
 * @param {Object} playerObj the player to add
 * @returns {Object} the player returned by the API
 */
const addNewPlayer = async (playerObj) => {
  try {
    const response = await fetch(`${API_URL}/players/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(playerObj),
    }
  );
  const result = await response.json();
  return result;
  } catch (err) {
    console.error("Oops, something went wrong with adding that player!", err);
  }
};

/**
 * Removes a player from the roster via the API.
 * @param {number} playerId the ID of the player to remove
 */
const removePlayer = async (playerId) => {
  try {
    const response = await fetch(`${API_URL}/players/${playerId}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json',}
      }
    );
    const result = await response.json();
    return result;
  } catch (err) {
    console.error(
      `Whoops, trouble removing player #${playerId} from the roster!`,
      err
    );
  }
};

/**
 * Updates `<main>` to display a list of all players.
 *
 * If there are no players, a corresponding message is displayed instead.
 *
 * Each player is displayed in a card with the following information:
 * - name
 * - id
 * - image (with alt text of the player's name)
 *
 * Additionally, each card has two buttons:
 * - "See details" button that, when clicked, calls `renderSinglePlayer` to
 *    display more information about the player
 * - "Remove from roster" button that, when clicked, will call `removePlayer` to
 *    remove that specific player and then re-render all players
 *
 * Note: this function should replace the current contents of `<main>`, not append to it.
 * @param {Object[]} playerList - an array of player objects
 */
const renderAllPlayers = (playerList) => {
  main.innerHTML = `
    <h2>All Players</h2>
    <div class="grid-cards">
      ${playerList.length === 0 ? "<p>No players yet!</p>" : playerList.map(player => {
        return `
          <div class="card grid-card-item" style="width: 18rem;">
            <img src="${player.imageUrl}" class="card-img-top grid-card-image" alt="player image: ${player.name}">
            <div class="card-body">
              <h5 class="card-title">${player.name}</h5>
              <p class="card-text">Position: ${player.status}</p>
              <p class="card-text">Id: ${player.id}</p>
              <a href="#" class="btn btn-primary seeDetails">See details</a>
              <a href="#" class="btn btn-primary removePlayer">Remove Player</a>
            </div>
          </div>
        `
      }).join('')}}
    </div>
  `
  const seeDetailsHtmlCollection = document.getElementsByClassName("seeDetails");
  var seeDetailsButtonArray = Array.prototype.slice.call(seeDetailsHtmlCollection); // converts a htmlCollection to an array
  const removePlayerHtmlCollection = document.getElementsByClassName("removePlayer");
  var removePlayerButtonArray = Array.prototype.slice.call(removePlayerHtmlCollection); // converts a htmlCollection to an array

  seeDetailsButtonArray.map(button => button.addEventListener("click", async (event) => {
    const id = event.target.parentNode.children[2].innerText.split(":")[1].trim(" ");
    const player = await fetchSinglePlayer(id);
    renderSinglePlayer(player);
  }));

  removePlayerButtonArray.map(button => button.addEventListener("click", async (event) => {
    const id = event.target.parentNode.children[2].innerText.split(":")[1].trim(" ");
    const player = await removePlayer(id);
    renderAllPlayers(player);
  }));
};

/**
 * Updates `<main>` to display a single player.
 * The player is displayed in a card with the following information:
 * - name
 * - id
 * - breed
 * - image (with alt text of the player's name)
 * - team name, if the player has one, or "Unassigned"
 *
 * The card also contains a "Back to all players" button that, when clicked,
 * will call `renderAllPlayers` to re-render the full list of players.
 * @param {Object} player an object representing a single player
 */
const renderSinglePlayer = (player) => {
  const thePlayer = player.data.player
  
  main.innerHTML = `
    <h2>Player Details</h2>
    <div class="card" style="width: 18rem;">
      <img src="${thePlayer.imageUrl}" class="card-img-top" alt="thePlayer image: ${thePlayer.name}">
      <div class="card-body">
        <h5 class="card-title">${thePlayer.name}</h5>
        <p class="card-text">Id: ${thePlayer.id}</p>
        <p class="card-text">Breed: ${thePlayer.breed}</p>
        <a href="#" class="btn btn-primary" id="backToAllPlayers">Back to all players</a>
      </div>
    </div>
  `
  const backToAllPlayers = document.getElementById("backToAllPlayers");

  backToAllPlayers.addEventListener("click", async (event) => {
    event.preventDefault();
    const players = await fetchAllPlayers();
    renderAllPlayers(players);
  })

};

/**
 * Fills in `<form id="new-player-form">` with the appropriate inputs and a submit button.
 * When the form is submitted, it should call `addNewPlayer`, fetch all players,
 * and then render all players to the DOM.
 */
const renderNewPlayerForm = () => {
  const newPlayerForm = document.getElementById("new-player-form");
  newPlayerForm.innerHTML = `
    <div class="mb-3">
    <label for="name" class="form-label">Player Name</label>
    <input type="text" class="form-control" id="name" placeholder="Enter player name">
    </div>
    <div class="mb-3">
      <label for="breed" class="form-label">Player Breed</label>
      <input type="text" class="form-control" id="breed" placeholder="Enter player breed">
    </div>
    <div class="mb-3">
      <label for="imageUrl" class="form-label">Player Image URL</label>
      <input type="text" class="form-control" id="imageUrl" placeholder="Enter player image URL">
    </div>
    <div class="mb-3">
      <label for="status" class="form-label">Player Status</label>
      <input type="text" class="form-control" id="status" placeholder="Enter player status">
    </div>
    <button type="submit" class="btn btn-primary" id="addNewPlayer">Add New Player</button>
  `
  const addNewPlayerButton = document.getElementById("addNewPlayer");

  addNewPlayerButton.addEventListener("click", async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const breed = document.getElementById("breed").value;
    const imageUrl = document.getElementById("imageUrl").value;
    const status = document.getElementById("status").value;
    const playerObj = {name, breed, imageUrl, status};
    const newPlayer = await addNewPlayer(playerObj);
    const players = await fetchAllPlayers();
    renderAllPlayers(players);
    return newPlayer;
  })
};

/**
 * Initializes the app by fetching all players and rendering them to the DOM.
 */
const init = async () => {
  const players = await fetchAllPlayers();
  renderAllPlayers(players);

  renderNewPlayerForm();
};

// This script will be run using Node when testing, so here we're doing a quick
// check to see if we're in Node or the browser, and exporting the functions
// we want to test if we're in Node.
if (typeof window === "undefined") {
  module.exports = {
    fetchAllPlayers,
    fetchSinglePlayer,
    addNewPlayer,
    removePlayer,
    renderAllPlayers,
    renderSinglePlayer,
    renderNewPlayerForm,
  };
} else {
  init();
}


