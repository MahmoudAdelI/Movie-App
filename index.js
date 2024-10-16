import { createStore, combineReducers } from "./redux.js";

const user = (state, action) => {
    switch (action.type) {
        case 'ADD_USER':
            return  {
                        userId: action.payload.userId,
                        name: action.payload.name,
                        type: action.payload.type,
                        favorites: [],
                        watchlist: [],
                        watched: []
                    }; 
                    
        case 'ADD_TO_FAVORITES':
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    favorites: [...state.favorites, {
                        movieId: action.payload.movieId
                    }]
                }
                : state;

        case 'REMOVE_FROM_FAVORITES':
            return state.userId === action.payload.userId ?
            {
                ...state,
                favorites: state.favorites.filter(m =>
                    m.movieId !== action.payload.movieId
                )
            }
            : state;

        case 'ADD_TO_WATCHLIST':            
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    watchlist: [...state.watchlist, {
                        movieId: action.payload.movieId
                    }]
                }
                : state;

        case 'REMOVE_FROM_WATCHLIST':
            return state.userId === action.payload.userId ?
            {
                ...state,
                watchlist: state.watchlist.filter(m => 
                    m.movieId !== action.payload.movieId 
                )
            } 
            : state;

        case 'ADD_TO_WATCHED':
            // vaildate user and movie in dispatcher
            return {
                ...state,
                watched: [...state.watched, {
                    movieId: action.payload.movieId,
                    startTime: action.payload.startTime,
                    watchedTime: 0,
                    pasuedTimes: 0,
                    completed: undefined,
                    finishedIn: undefined,
                    // isPlaying: false
                }]
            }

        case 'UPDATE_WATCHED': 
                // vaildate user and movie in dispatcher
                return {
                    ...state,
                    watched: state.watched.map(m =>
                    m.movieId === action.payload.movieId ?
                        {...m,
                            watchedTime: m.watchedTime + action.payload.watchedTime,
                            pasuedTimes: m.pasuedTimes + 1,
                            completed: action.payload.completed,
                            finishedIn: action.payload.finishedIn,
                            }
                        : m
                    )
                };

        // case 'TOGGLE_PLAY_PAUSE':
        //     return {
        //         ...state,
        //         watched: state.watched.map(m =>
        //             m.movieId === action.payload.movieId ?
        //             {...m, isPlaying: !m.isPlaying} 
        //             : m
        //         )
        //     };
                  
        default:
            return state;
    }
}
const usersReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_USER':
            return [...state, user(undefined, action)];

        case 'ADD_TO_FAVORITES':        
            return state.map(u => user(u, action));

        case 'REMOVE_FROM_FAVORITES':
            return state.map(u => user(u, action));
            
        case 'ADD_TO_WATCHLIST':           
            return state.map(u => user(u, action));

        case 'REMOVE_FROM_WATCHLIST':
            return state.map(u => user(u, action));

        case 'ADD_TO_WATCHED':
            return state.map(u => user(u, action));
        
        case 'UPDATE_WATCHED':
            return state.map(u => user(u, action)); 

        case 'TOGGLE_PLAY_PAUSE':
            return state.map(u => user(u, action));

        default:
            return state;
    };
};

const movie = (state, action) => {
    switch (action.type) {
        case'ADD_MOVIE':            
                return {
                        movieId: action.payload.movieId,
                        title: action.payload.title,
                        // img: action.payload.img,
                        details: action.payload.details,
                        duration: action.payload.duration,
                        ratings: [],
                        addedBy: action.payload.addedBy
                    };
                                              
        case 'RATE_MOVIE': 
                return state.movieId === action.payload.movieId ?        
                    {
                        ...state,
                        ratings: [...state.ratings, {
                            userId: action.payload.ratedBy,
                            rating: action.payload.rating
                        }]
                    } 
                    : state;

        default:
            return state;
    }
}

const movieReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_MOVIE':
                return [...state, movie(undefined, action)];                  

        case 'DELETE_MOVIE':   
                return state.filter( movie => movie.movieId !== action.payload.movieId );

        case 'RATE_MOVIE':
            return state.map(m => movie(m, action));

        case 'WATCHERS':
            return state.map(m => movie(m , action))
            
        default:
                return state;
    };
};

export const addUser = (userId, name, type) => {
    return store.dispatch({
        type: 'ADD_USER',
        payload: {userId, name, type}
    });
};

const getUser = userId => store.getState().users.find(user => user.userId === userId);

export const addMovie = (movieId, title, details, addedBy, duration) => {
    const user = getUser(addedBy);
    return user.type === 'ADMIN' ? 
        store.dispatch({
        type: 'ADD_MOVIE',
        payload: {movieId, title, details, addedBy, duration}
        }) : console.error('only admin can add movies');
};

export const deleteMovie = (movieId, deletedBy) => {
    const user = getUser(deletedBy);
    return user.type === 'ADMIN' ?
        store.dispatch({
        type: 'DELETE_MOVIE',
        payload: {movieId, deletedBy}
        }) : console.error('only admin can delete movies');
};

export const rateMovie = (movieId, rating, ratedBy) => {
    const movie = getMovie(movieId);
    const user = getUser(ratedBy);
    if(movie) {
        return user && user.type === 'USER' ?
            store.dispatch({
            type: 'RATE_MOVIE',
            payload: {movieId, rating, ratedBy}
        }) : console.error('only users can rate movies');
    } else {console.error('movie not found')};
};

const getMovie = movieId => store.getState().movies.find(movie => movie.movieId === movieId);

export const toggleFavorites = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.favorites.some(m => m.movieId === movieId);
    if(!movie) {
        return store.dispatch({
        type: 'ADD_TO_FAVORITES',
        payload: {userId, movieId} 
    })
    } else {
        console.error('movie already in the favorites')
        return store.dispatch({
        type: 'REMOVE_FROM_FAVORITES',
        payload: {userId, movieId}
    })
    }
};

export const toggleWatchlist = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.watchlist.some(m => m.movieId === movieId);
    if(!movie) {
        return store.dispatch({
            type: 'ADD_TO_WATCHLIST',
            payload: {userId, movieId}
        })
    } else {
        console.error('movie already in the watchlist')
        return store.dispatch({
            type: 'REMOVE_FROM_WATCHLIST',
            payload: {userId, movieId}
        })
    }
};

export const addToWatched = (userId, movieId, startTime) => {
    const user = getUser(userId);
    const movie = user.watched.some(m => m.movieId === movieId);
     if(!movie) {
        return store.dispatch({
        type: 'ADD_TO_WATCHED',
        payload: {movieId, startTime}
    })
    } ;  
};

export const updateWatched = (userId, movieId, watchedTime, endTime) => {
    const user = getUser(userId);
    const watchedMovie = user.watched.find(m => m.movieId === movieId);
    const movie = getMovie(movieId);
    if(watchedMovie) {
        // if completed is already set we retrive the first value we don't need to refresh
        // its value with every pause
        const completed = watchedMovie.watchedTime + watchedTime >= movie.duration ?
        watchedMovie.completed || `completed at ${endTime.toLocaleString()}` : false;
        // same logic here with finishedIn
        const finishedIn = completed ?
        watchedMovie.finishedIn || dateFns.intervalToDuration({start: watchedMovie.startTime, end: endTime}) : false;

        return store.dispatch({
            type: 'UPDATE_WATCHED',
            payload: {movieId, watchedTime, completed, finishedIn}
        })
    };
};
// export const togglePlayPause = movieId => {
//     store.dispatch({
//         type: 'TOGGLE_PLAY_PAUSE',
//         payload: {movieId}
//     })
// }
export const getAllMovies = () => {
    return store.getState().movies;
};

export const getUsersWhoWatchedMovie = movieId => { // TEST
    return store.getState().users.filter(u => u.watched.some(m => m.movieId === movieId))
};

export const getWatchedTime = (userId, movieId) => {
    const user = getUser(userId);
    const movie = user.watched.find(m => m.movieId === movieId);
    return movie ?
    movie.watchedTime : console.error('movie not found');
};

export const getRatedMovies = userId => {
    return store.getState().movies.filter(m => m.ratings.some(r => r.userId === userId))
};

export const getUsersWhoRatedMovie = movieId => {
    const movie = getMovie(movieId);
    return movie ? movie.ratings.map(r => r.userId) : 'movie not found';
};

export const getOverAllRate = movieId => {
    const movie = getMovie(movieId);
    if(movie && movie.ratings.length > 0) { 
        const ratings = movie.ratings.map(r => r.rating);
        const ratingsSum = ratings.reduce((acc, current)=> acc + current, 0);
        return Math.round(ratingsSum / ratings.length) + '/10';
    } else {
        return 0 + '/10'
    };
};

const loadState = () => {
    const serializedState = localStorage.getItem('rootReducer');
    if(serializedState === null) return undefined;
    return JSON.parse(serializedState);
}
const saveState = (state) => {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('rootReducer', serializedState)
};
const cachedState = loadState();
const rootReducer = combineReducers({ users: usersReducer, movies: movieReducer });
export const store = createStore(rootReducer, cachedState);

store.subscribe(() => saveState(store.getState()))


//adding users
// addUser(10, 'mahmoud', 'ADMIN');
// addUser(20, 'ahmed', 'USER');
// addUser(30, 'yasser', 'USER');
// addUser(40, 'karam', 'USER');

//adding movies
//addMovie(0, 'Taxi Driver', 'a movie about a depresed taxi driver', 10, './imgs/taxi-driver.jpg');
// addMovie(1, 'Inception', 'nobody actually knows what is going on', 10, './imgs/inception.jpg');
// addMovie(2, 'The Godfather', 'it is about mafia and everone dies', 10, './imgs/the-godfather.jpg');

//deleting movies
//deleteMovie(1, 10);

//rating movies
// rateMovie(0, 8.5, 20);
// rateMovie(0, 9.7, 30);


//get all movies
//console.log(getAllMovies());

//add to favorites
//addToFavorites(10, 0);

//add to watchlist
//addToWatchlist(10, 1);

//get overall movie rate
//store.subscribe(() => console.log(getOverAllRate(0)));;
//find who rated a movie
//store.subscribe(() => console.log(whoRatedMovie(0)));

store.subscribe(() => {console.log(store.getState())});
//console.log(store.getState())