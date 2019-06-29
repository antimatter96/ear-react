import { render } from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import App from './App'

import Data from './data.json'
import Keys from './keys.json'

const root = document.getElementById('root')

const load = () => render((
  <AppContainer>
    <App data={Data} _keys={Keys} />
  </AppContainer>
), root)

// This is needed for Hot Module Replacement
if (module.hot) {
  module.hot.accept('./App', load)
}

load()
