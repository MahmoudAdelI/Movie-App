import { createStore, combineReducers } from "./redux.js";

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
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    favorites: [...state.favorites, {
                        id: action.payload.movieId
                    }]
                }
                : state;
        case 'ADD_TO_WATCHLIST':            
            return state.userId === action.payload.userId ? 
                {
                    ...state,
                    watchlist: [...state.watchlist, {
                        id: action.payload.movieId
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
                return {
                        id: action.payload.movieId,
                        title: action.payload.title,
                        details: action.payload.details,
                        ratings: [],
                        addedBy: action.payload.addedBy
                    };
                                              
        case 'RATE_MOVIE': 
                return state.id === action.payload.movieId ?        
                    {
                        ...state,
                        ratings: [...state.ratings, {
                            id: action.payload.ratedBy,
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
                return state.filter( movie => movie.id !== action.payload.movieId );

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

const addMovie = (movieId, title, details, addedBy) => {
    const user = store.getState().users.find(user => user.userId === addedBy);
    return user.type === 'ADMIN' ? 
        store.dispatch({
        type: 'ADD_MOVIE',
        payload: {movieId, title, details, addedBy}
        }) : console.error('only admin can add movies');
};

const deleteMovie = (movieId, deletedBy) => {
    const user = store.getState().users.find(user => user.userId === deletedBy);
    return user.type === 'ADMIN' ?
        store.dispatch({
        type: 'DELETE_MOVIE',
        payload: {movieId, deletedBy}
        }) : console.error('only admin can add movies');
};

const rateMovie = (movieId, rating, ratedBy) => {
    const user = store.getState().users.find(user => user.userId === ratedBy);
    return user.type === 'USER' ?
        store.dispatch({
        type: 'RATE_MOVIE',
        payload: {movieId, rating, ratedBy}
    }) : console.error('only users can add movies');
};

const addToFavorites = (userId, movieId) => {
    const movie = store.getState().movies.find(movie => movie.id === movieId);
    return movie ?
        store.dispatch({
        type: 'ADD_TO_FAVORITES',
        payload: {userId, movieId}
    }) : console.error('movie not found');
};

const addToWatchlist = (userId, movieId) => {
    const movie = store.getState().movies.find(movie => movie.id === movieId);
    return movie ?
        store.dispatch({
        type: 'ADD_TO_WATCHLIST',
        payload: {userId, movieId}
    }) : console.error('movie not found');
};

const getAllMovies = () => {
    return store.getState().movies;
};

const whoRatedMovie = (movieId) => {
    const movie = store.getState().movies.find(movie => movie.id === movieId);
    return movie ? movie.ratings.map(r => r.id) : 'movie not found';
};

const rootReducer = combineReducers({ users: usersReducer, movies: movieReducer });
const store = createStore(rootReducer);

//adding users
addUser(10, 'mahmoud', 'ADMIN');
addUser(20, 'ahmed', 'USER');
addUser(30, 'yasser', 'USER');

//adding movies
addMovie(0, 'Taxi Driver', 'a movie about a deppresed taxi driver', 10);
addMovie(1, 'Inception', 'nobody actually knows what is going on', 10);
addMovie(2, 'The Godfather', 'it is about mafia and everone dies', 10);

//deleting movies
deleteMovie(1, 20);

//rating movies
rateMovie(0, 8.5, 20);
rateMovie(0, 9.7, 30);

//get all movies
console.log(getAllMovies());

//add to favorites
addToFavorites(10, 0);

//add to watchlist
addToWatchlist(10, 1);

//find who rated a movie
console.log(whoRatedMovie(0));

console.log(store.getState());
