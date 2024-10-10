import { createStore, combineReducers } from "./redux.js";

//const randomId = () => Math.floor(Math.random() * 10000000000);
const user = (state, action) => {
    switch (action.type) {
        case 'ADD_USER':
            return  {
                        userId: action.payload.userId,
                        name: action.payload.name,
                        type: action.payload.type,
                        favorites: [],
                        watchlist: []
                    }; 
        case 'ADD_TO_FAVORITES':
            const favMovie = action.payload.state.find(movie => movie.id === action.payload.movieId);
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    favorites: [...state.favorites, {
                        title: favMovie.title,
                        details: favMovie.details
                    }]
                }
                : state;
        case 'ADD_TO_WATCHLIST':
            const watchMovie = action.payload.state.find(movie => movie.id === action.payload.movieId);
            
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    watchlist: [...state.watchlist, {
                        title: watchMovie.title,
                        details: watchMovie.details
                    }]
                }
                : state;
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
            
        case 'ADD_TO_WATCHLIST':           
            return state.map(u => user(u, action));
        default:
            return state;
    };
};

const movie = (state, action) => {
    switch (action.type) {
        case'ADD_MOVIE':
            const addUser = action.payload.users.find( user => user.userId === action.payload.addedBy );
            console.log(` added by: ${addUser.name}`);
            if (addUser && addUser.type === 'ADMIN') {
                return {
                        id: action.payload.movieId,
                        title: action.payload.title,
                        details: action.payload.details,
                        ratings: [],
                        addedBy: addUser.name
                    };
                                      
                } else {
                    console.error(`only admin can add movies`)
                    return state;
                };
            

        case 'RATE_MOVIE': 
            const rateUser = action.payload.users.find(user => user.userId === action.payload.ratedBy); 
            //console.log(rateUser);
            if(rateUser && rateUser.type === 'USER') {
                return state.id === action.payload.movieId ?        
                    {
                        ...state,
                        ratings: [...state.ratings, {
                            id: rateUser.userId,
                            name: rateUser.name,
                            rating: action.payload.rating
                        }]
                    } 
                    : state
                
            } else {
                {console.error(`only user can rate movies`)};
                    return state;
            }
        default:
            return state;
    }
}

const movieReducer = (state = [], action) => {
    switch (action.type) {
        case 'ADD_MOVIE':
                return [...state, movie(undefined, action)];                  

        case 'DELETE_MOVIE':
            const deleteUser = action.payload.users.find(user => user.userId === action.payload.deletedBy);
            //console.log(` deleted by: ${deleteUser.name}`);
            if(deleteUser && deleteUser.type === 'ADMIN') {
                return state.filter( movie => movie.id !== action.payload.movieId );
            } else {
                {console.error(`only admin can delete movies`)};
                return state;
            }

        case 'RATE_MOVIE':
            return state.map(m => movie(m, action));
            
        default:
                return state;
    };
};

const addUser = (userId, name, type) => {
    return store.dispatch({
        type: 'ADD_USER',
        payload: {userId, name, type}
    });
};

const addMovie = (movieId, title, details, addedBy, users) => {
    return store.dispatch({
        type: 'ADD_MOVIE',
        payload: {movieId, title, details, addedBy, users}
    });
};

const deleteMovie = (movieId, deletedBy, users) => {
    return store.dispatch({
        type: 'DELETE_MOVIE',
        payload: {movieId, deletedBy, users}
    });
};

const rateMovie = (movieId, rating, ratedBy, users) => {
    return store.dispatch({
        type: 'RATE_MOVIE',
        payload: {movieId, rating, ratedBy, users}
    });
};

const addToFavorites = (userId, movieId, state) => {
    return store.dispatch({
        type: 'ADD_TO_FAVORITES',
        payload: {userId, movieId, state}
    });
};

const addToWatchlist = (userId, movieId, state) => {
    return store.dispatch({
        type: 'ADD_TO_WATCHLIST',
        payload: {userId, movieId, state}
    });
};

const getAllMovies = () => {
    return store.getState().movies;
};

const whoRatedMovie = (movieId, users) => {
    // this approach gets the ratings array.
    // const movie = store.getState().movies.find(movie => movie.id === movieId);
    // return movie ? movie.ratings : `Movie not found`;
    //.......................

    //// this approach gets the users objects who rated themselves.
    const movieRatings = store.getState().movies.find(movie => movie.id === movieId).ratings;
    //using sets is much faster than using array.icludes
    const userIDs = new Set(movieRatings.map(rating => rating.id));
    const ratedUsers = users.filter(user => userIDs.has(user.userId))
    
    return ratedUsers;
}

const rootReducer = combineReducers({ users: usersReducer, movies: movieReducer });
const store = createStore(rootReducer);

//adding users
addUser(10, 'mahmoud', 'ADMIN');
addUser(20, 'ahmed', 'USER');
addUser(30, 'yasser', 'USER');

//adding movies
addMovie(0, 'Taxi Driver', 'a movie about a deppresed taxi driver', 10, store.getState().users);
addMovie(1, 'Inception', 'nobody actually knows what is going on', 10, store.getState().users);
addMovie(2, 'The Godfather', 'it is about mafia and everone dies', 10, store.getState().users);

//deleting movies
//deleteMovie(1, 10, store.getState().users);

//rating movies
rateMovie(0, 8.5, 20, store.getState().users);
rateMovie(0, 9.7, 30, store.getState().users);

//get all movies
console.log(getAllMovies());

//add to favorites
addToFavorites(10, 0, store.getState().movies);
//add to watchlist
//addToWatchlist(10, 1, store.getState().movies);

//find who rated a movie
console.log(whoRatedMovie(0, store.getState().users));

console.log(store.getState());
