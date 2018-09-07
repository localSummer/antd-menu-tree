import React, { Component } from "react";
import {Provider} from 'mobx-react';
import rootStore from './mobx/rootStore';
import DevTools from 'mobx-react-devtools';
import Tree from "./views/Tree";
import "./App.css";

class App extends Component {
    render() {
        return (
            <Provider rootStore={rootStore}>
                <div className="App">
                    <Tree />
                    <DevTools/>
                </div>
            </Provider>    
        );
    }
}

export default App;
