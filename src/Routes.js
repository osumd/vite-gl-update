import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import FriedmanPage from './Friedman';
export const Routes = () => {
    return (
        <Router>
            <Switch>
                <Route path="/Friedman">
                    <FriedmanPage></FriedmanPage>
                </Route>
            </Switch>
        </Router>
    )
}