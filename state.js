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
                    completed: undefined,
                    finishedIn: undefined,
                    isPlaying: true,
                    timer: 0
                }]
            }
        case 'UPDATE_TIMER':
            return {
                ...state,
                watched: state.watched.map(m =>
                m.movieId === action.payload.movieId ?
                {
                    ...m,
                    timer: m.timer + 1
                } : m
            )
            }

        case 'UPDATE_WATCHED': 
                // vaildate user and movie in dispatcher
                return {
                    ...state,
                    watched: state.watched.map(m =>
                    m.movieId === action.payload.movieId ?
                        {...m,
                            completed: action.payload.completed,
                            finishedIn: action.payload.finishedIn,
                            }
                        : m
                    )
                };

        case 'TOGGLE_PLAY_PAUSE':
            return {
                ...state,
                watched: state.watched.map(m =>
                    m.movieId === action.payload.movieId ?
                    {...m, isPlaying: !m.isPlaying} 
                    : m
                )
            };
                  
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

        case 'UPDATE_TIMER': // test
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

        case 'UPDATE_RATINGS':
            return state.movieId === action.payload.movieId ?
            {
                ...state,
                ratings: state.ratings.map(r=>
                    r.userId === action.payload.ratedBy ?
                    {
                        ...r,
                        rating: action.payload.rating
                    } : r
                 )
            } : state;           

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

        case 'UPDATE_RATINGS':
            return state.map(m => movie(m , action))
            
        default:
                return state;
    };
};

const undoable = (reducer) => {
    // this is the shape of my final state
    const initialState = {
        past: [],
        present: reducer(undefined, {}),
        future: []
    }
    // Return a reducer that handles undo and redo
    return (state = initialState, action) => {
        const {past, present, future} = state;

        switch (action.type) {
            case 'UNDO':
                const previous = past[past.length - 1]; 
                const newPast = past.slice(0, past.length - 1); 
                return {
                    past: newPast, // remove the last state from the past
                    present: previous, // the last state in the past
                    future: [present, ...future] // add the present state to the future
                };

            case 'REDO':
                const next = future[0];
                const newFuture = future.slice(1);
                return {
                    past: [...past, present], // add the present state to the past
                    present: next, // the first state in the future
                    future: newFuture // remove the first state from the future  
                };
            
            default:
                /*if the action was anything else we pass it to the reducer with the
                present state and check if the new state returned from the reducer is
                equal to the present state we have, we return the state as it is.
                if not return the state with the new present state and add the last state to the past */
                const newPresent = reducer(present, action)
                if(present === newPresent) {
                    return state;
                }
                return {
                    past: [...past, present],
                    present: newPresent,
                    future: []
                };
        };
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
const undoableReducer = undoable(rootReducer);
export const store = createStore(undoableReducer, cachedState);


store.subscribe(() => saveState(store.getState()));
store.subscribe(() => {console.log(store.getState())});