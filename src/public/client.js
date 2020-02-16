let store = Immutable.Map({
    user: {
        name: "Student"
    },
    apod: '',
    rovers: ['curiosity', 'opportunity', 'spirit'],
    recent_photos: [],
    current_rover: 'curiosity',
    rover: ''
})

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (state, newState) => {
    store = state.merge(newState)
    render(root, store)
}

const render = async (root, state) => {
    root.innerHTML = App(state.toJS())
}

// create content
const App = (state) => {
    const rover = state.rover;
    const recent_photos = state.recent_photos;
    const current_rover = state.current_rover;
    const username = state.user.name;

    return `
        <header></header>
        <main>
            ${Greeting(username)}
            ${RoverSelector(current_rover)}
            ${RoverInformation(current_rover, rover)}
            ${Carousel(recent_photos, current_rover)}
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)
})

// ------------------------------------------------------  COMPONENTS

const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome to Mars Dashboard ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

function changeRover() {
    const selectedRover = document.getElementById("roverSelector").value;

    updateCurrentRover(selectedRover, store)
  }

const RoverSelector = (current_rover) => {
    rovers_text = ""
    store.get('rovers').map(rover => rovers_text += `<p>${rover}</p>`)
    return (`
        <select id="roverSelector" onchange="changeRover()">
            ${store.get('rovers').map(rover => 
                (rover === current_rover) ? `<option value="${rover}" selected>${rover}</option>` : `<option value="${rover}">${rover}</option>` )}
        </select>
    `)
}

RoverInformation = (rover_name, rover) => {
    if( rover === '' ) {
        getRoverInfo(rover_name, store)
    } else  {
        return (`
            <h2> Rover Information </h2>
            <div class="info-container">
                <div class="card">
                    <h3> Rover Max Date </h3>
                    <p>${rover.max_date}</p>
                </div>
                <div class="card">
                    <h3> Rover Landing Date </h3>
                    <p>${rover.landing_date}</p>
                </div>
                <div class="card">
                    <h3> Rover Launch Date </h3>
                    <p>${rover.launch_date}</p>
                </div>
                <div class="card">
                    <h3> Rover Status </h3>
                    <p>${rover.status}</p>
                </div>
            </div>
        `)
    }
}

const Carousel = (recent_photos, current_rover) => {
    if (recent_photos.length === 0) {
        getRoverRecentImages(store)
    }

    return (`
        <h2> Recent ${current_rover} Images </h2>
        <div class="image-container">
            ${recent_photos.map(photo => `<img class="rover-img" src="${photo}">`)}
        </div>
    `)
}

// ------------------------------------------------------  API CALLS

const updateCurrentRover = async (current_rover, state) => { 
    const newState = state.set('current_rover', current_rover);
    updateStore(state, { current_rover })
    getRoverInfo(current_rover, newState)
    getRoverRecentImages(newState)
}

const getRoverInfo = async (current_rover, state) => {
    const dateResponse = await fetch(`http://localhost:3000/roverInfo/${current_rover}`)
    const dateResult = await dateResponse.json()

    let rover = dateResult.info.photo_manifest
   
    updateStore(store, { rover })
}

const getRoverRecentImages = async (state) => {
    const dateResponse = await fetch(`http://localhost:3000/roverInfo/${state.get('current_rover')}`)
    const dateResult = await dateResponse.json()
    const max_date = dateResult.info.photo_manifest.max_date
    const response = await fetch(`http://localhost:3000/roverRecent?rover=${state.get('current_rover')}&date=${max_date}`)
    const result = await response.json()
    let recent_photos = result.data
    updateStore(store, { max_date, recent_photos })
}