let store = {
    user: {
        name: "Student"
    },
    apod: '',
    rovers: ['curiosity', 'opportunity', 'spirit'],
    recent_photos: [],
    current_rover: 'curiosity',
    rover: ''
}

// add our markup to the page
const root = document.getElementById('root')

const updateStore = (store, newState) => {
    store = Object.assign(store, newState)
    render(root, store)
}

const render = async (root, state) => {
    console.log("xxxxxxxxxxxxxxxxxxxx")
    root.innerHTML = App(state)
}


// // create content
// const App = (state) => {
//     let {
//         max_date,
//         recent_photos,
//         current_rover,
//         apod
//     } = state

//     return `
//         <header></header>
//         <main>
//             ${RoverSelector()}
//             ${RoverInformation(current_rover, max_date)}

//             ${Greeting(store.user.name)}
//             <section>
//                 <h3>Put things on the page!</h3>
//                 <p>Here is an example section.</p>
//                 <p>
//                     One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
//                     the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
//                     This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
//                     applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
//                     explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
//                     but generally help with discoverability of relevant imagery.
//                 </p>
//                 ${ImageOfTheDay(apod)}
//             </section>
//         </main>
//         <footer></footer>
//     `
// }

// create content
const App = (state) => {
    let {
        rover,
        recent_photos,
        current_rover,
        apod
    } = state

    return `
        <header></header>
        <main>
            ${Greeting(store.user.name)}
            ${RoverSelector(current_rover)}
            ${RoverInformation(current_rover, rover)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${Carousel(recent_photos)}
            </section>
        </main>
        <footer></footer>
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store)


})

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    console.log("Greeting component called")
    if (name) {
        return `
            <h1>Welcome to Mars Dashboard ${name}!</h1>
        `
    }

    return `
        <h1>Hello!</h1>
    `
}

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    console.log("ImageOfTheDay Component")
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date()
    const photodate = new Date(apod.date)
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store)
        //getRoverMaxDate(store)
        //getRoverRecentImages(store)
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === "video") {
        return (`
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `)
    } else {
        return (`
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `)
    }
}


function changeRover() {
    const selectedRover = document.getElementById("roverSelector").value;
    console.log("You selected: " + selectedRover);

    updateCurrentRover(selectedRover, store)
  }

const RoverSelector = (current_rover) => {
    rovers_text = ""
    store.rovers.map(rover => rovers_text += `<p>${rover}</p>`)
    return (`
        <select id="roverSelector" onchange="changeRover()">
            ${store.rovers.map(rover => 
                (rover === current_rover) ? `<option value="${rover}" selected>${rover}</option>` : `<option value="${rover}">${rover}</option>` )}
        </select>
    `)
}

RoverInformation = (rover_name, rover) => {
    console.log("Start rover info comp", rover)

    // TODO: make sure to check if you really need to fetch the info
    if( rover === '' ) {
        console.log("We will fetch, Rover should be empty", rover)
        getRoverInfo(rover_name, store)
    } else  {
        return (`
            <h2> Rover Information </h2>
            <ul> 
                <li> <lable> Rover Max Date: <label> ${rover.max_date} </li>
                <li> <lable> Rover Landing Date: <label> ${rover.landing_date} </li>
                <li> <lable> Rover Launch Date: <label> ${rover.launch_date} </li>
                <li> <lable> Rover Status: <label> ${rover.status} </li>
            </ul>
            
             
        `)
    }
}

const Carousel = (recent_photos) => {
    if (recent_photos.length === 0) {
        getRoverRecentImages(store)
    }

    console.log("Corasel component ", recent_photos)
    return (`
        ${recent_photos.map(photo => `<img width="100%" src="${photo}">`)}
    `)
}

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = async (state) => {
    let {
        apod
    } = state

    const response = await fetch(`http://localhost:3000/apod`)
    apod = await response.json()

    console.log("getImageOfTheDay: store will be updated")
    updateStore(store, {
        apod
    })
    
    //return data
}

const getRoverMaxDate = async (state) => {
    // make the request with varies rover names
    //Rovers names are
    // Curiosity, Opportunity, and Spirit 

    let {
        max_date
    } = state
    const response = await fetch(`http://localhost:3000/roverInfo/${state.current_rover}`)
    const result = await response.json()
    console.log(result)
    console.log(result.info.photo_manifest.max_date)
    max_date = result.info.photo_manifest.max_date
    //updateStore(store, { max_date })
}

const updateCurrentRover = async (new_rover, state) => { 
    state.current_rover = new_rover
    getRoverInfo(new_rover, state)
    getRoverRecentImages(state)
}

const getRoverInfo = async (current_rover, state) => {
    // make the request with varies rover names
    //Rovers names are
    // Curiosity, Opportunity, and Spirit 

    let {
        rover
    } = state

    const dateResponse = await fetch(`http://localhost:3000/roverInfo/${current_rover}`)
    const dateResult = await dateResponse.json()

    // max_date = dateResult.info.photo_manifest.max_date
    // landing_date = dateResult.info.photo_manifest.landing_date
    // launch_date = dateResult.info.photo_manifest.launch_date
    // total_photos = dateResult.info.photo_manifest.total_photos
    rover = dateResult.info.photo_manifest
    console.log(rover)

    console.log("getRoverInfo: store will be updated for", current_rover)
    updateStore(store, { rover })
}

const getRoverRecentImages = async (state) => {
    // make the request with varies rover names
    //Rovers names are
    // Curiosity, Opportunity, and Spirit 

    let {
        max_date,
        recent_photos
    } = state

    const dateResponse = await fetch(`http://localhost:3000/roverInfo/${state.current_rover}`)
    const dateResult = await dateResponse.json()

    max_date = dateResult.info.photo_manifest.max_date
    console.log("getRoverRecentImages with max date",max_date)
    const response = await fetch(`http://localhost:3000/roverRecent?rover=${state.current_rover}&date=${max_date}`)
    const result = await response.json()
    recent_photos = result.data
    updateStore(store, { max_date, recent_photos })
}