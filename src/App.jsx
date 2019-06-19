import * as React from 'react'

import './App.css'
import Select from 'react-select'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      list: props.data,
      selectedEntries: null,
      filtered: false
    }
    this.listingsElement = React.createRef()
    this.handleClick = this.handleClick.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (event) {
    let startTime = performance.now()

    let countryArrMain = this.state.countryArrMain
    let locationData = this.props.data

    console.log('selected', event)
    let selectedEntriesArray = event

    // if (isMobile) {
    //   let selectedOptions = document.getElementById("customFilter-select").selectedOptions;

    //   for (let i = 0; i < selectedOptions.length; i++) {
    //     if (selectedOptions[i].value) {
    //       selectedEntriesArray.push(selectedOptions[i].value);
    //     }
    //   }

    // }

    if (!selectedEntriesArray || selectedEntriesArray.length < 1) {
      console.log(`searchFilter empty`)
      this.setState({
        list: locationData
      })
      return
    }

    selectedEntriesArray.sort()

    let tt = []

    for (let i = 0; i < selectedEntriesArray.length; i++) {
      let countryIndex = selectedEntriesArray[i].value.split('-')[0]
      let locIndex = selectedEntriesArray[i].value.split('-')[1]

      let countryString = countryArrMain[countryIndex]['c'].split('{')[0].trimRight()
      let locationString = countryArrMain[countryIndex]['l'][locIndex].split(':')[2]
      locationString = locationString.replace(/"|}/g, '')

      tt.push({
        'c': countryString,
        'l': locationString
      })
    }

    let finalS = []

    for (let i = 0; i < locationData.length; i++) {
      let locations = locationData[i].locations

      let isWanted = false

      if (!locations) {
        continue
      }

      for (let j = 0; j < locations.length; j++) {
        let thisC = locations[j].country
        let thisL = locations[j].loc
        for (let k = 0; k < tt.length; k++) {
          if (tt[k].c === thisC && tt[k].l === thisL) {
            isWanted = true
            break
          }
        }
        if (isWanted) {
          break
        }
      }

      if (isWanted) {
        finalS.push(locationData[i])
      }
    }

    console.log(finalS)
    let duration = performance.now() - startTime
    console.log(`searchFilter took ${duration}ms`)
    this.setState({
      list: finalS
    })
  }

  generateIndex () {
    let entries = this.props.data
    console.log('Start fMain')
    let startTime = performance.now()
    let countryMap = new Map()
    for (let i = 0; i < entries.length; i++) {
      let locEntry = entries[i].locations
      if (!locEntry) {
        continue
      }
      for (let j = 0; j < locEntry.length; j++) {
        let country = locEntry[j].country
        let loc = locEntry[j].loc

        if (!loc && !country) {
          continue
        }
        if (!country) {
          country = 'World'
        }
        if (!loc) {
          loc = 'Unknown'
        }
        loc = loc.toLowerCase()
        loc = loc.replace(/\s|,|'/g, '')

        let mapEntry = countryMap.get(country)
        let z = {
          'l': loc,
          'full': locEntry[j].loc
        }
        let x = JSON.stringify(z)

        if (mapEntry) {
          if (mapEntry.has(x)) {
            continue
          } else {
            mapEntry.add(x)
          }
        } else {
          countryMap.set(country, new Set([x]))
        }
      }
    }

    let countryArr = []

    let countryIter = countryMap.entries()

    let country = countryIter.next()
    while (!country.done) {
      countryArr.push(country.value)
      country = countryIter.next()
    }

    countryArr = countryArr.sort(function (a, b) {
      if (a[1].size > b[1].size) {
        return -1
      } else if (a[1].size < b[1].size) {
        return 1
      } else {
        return a[0] > b[0]
      }
    })

    // let sel = document.createElement('select')

    // if (!isMobile) {
    //   let dummyOption = document.createElement('option')
    //   dummyOption.value = ''
    //   sel.appendChild(dummyOption)
    // }
    let countryArrMain = []
    for (let i = 0; i < countryArr.length; i++) {
      let temp = {}
      temp['c'] = countryArr[i][0]

      let arr = new Array(...countryArr[i][1])
      arr = arr.sort()

      temp['l'] = arr
      countryArrMain[i] = temp
    }

    let asd = []

    for (let i = 0; i < countryArrMain.length; i++) {
      let as = {}
      as['label'] = countryArrMain[i]['c']
      let z = countryArrMain[i]['l']

      let we = []

      for (let j = 0; j < z.length; j++) {
        let re = {}
        let k = JSON.parse(z[j])
        re['value'] = '' + i + '-' + j
        re['label'] = k.full || 'Unknown'
        we.push(re)
      }
      as['options'] = we
      asd.push(as)
    }

    this.setState({
      optionList: asd,
      countryArrMain: countryArrMain
    })

    let duration = performance.now() - startTime
    console.log(`fMain took ${duration}ms`)
  }

  handleClick () {
    this.generateIndex()
    this.setState({
      selectedEntries: new Set(),
      filtered: true
    })
  }

  render () {
    if (this.state.filtered) {
      this.asd = (
        <Select
          options={this.state.optionList}
          isMulti
          isSearchable
          onChange={this.handleChange}
        />
      )
    } else {
      this.asd = (
        <div>
          Filter based on location ?
          <button id='filter-start' className='act-btn' onClick={this.handleClick}>Yes</button>
          <button id='filter-do' className='act-btn' hidden>Filter</button>
        </div>
      )
    }
    let _listings = this.state.list
    this.asd2 = (
      <Listings ref={this.listingsElement} listings={_listings} _keys={this.props._keys} />
    )
    return (
      <div className='App'>
        {this.asd}
        {this.asd2}
      </div>
    )
  }
}

class Listings extends React.Component {
  render () {
    this.listings = this.props.listings.map((listItem) => {
      // console.log("listitwm", listItem);
      return (
        <Listing key={listItem[this.props._keys[0]]} data={listItem} _keys={this.props._keys} />
      )
    })
    return (
      <div id='list'>
        {this.listings}
      </div>
    )
  }
}

class Listing extends React.Component {
  constructor (props) {
    super(props)
    let locs = props.data[props._keys[2]]
    if (!locs) {
      this.locs = (
        <span className='location-entry'>
          <span className='location-name'>Worldwide</span>
          <span className='location-country'>Worldwide</span>
        </span>
      )
    } else {
      this.locs = locs.map((loc) => {
        return (
          <span className='location-entry' key={loc[props._keys[4]] + loc[props._keys[3]].replace(/^[a-z0-9A-Z]/gi, '')}>
            <span className='location-name'>{loc[props._keys[3]]}</span>
            <span className='location-country'>{loc[props._keys[4]]}</span>
          </span>
        )
      })
    }
  }

  render () {
    return (
      <div className='listentry-container'>
        <div className='listEntry'>
          <span className='entry-name'>{this.props.data[this.props._keys[0]]}</span>
          <div className='location-container'>
            {this.locs}
          </div>
          <a href={this.props.data[this.props._keys[1]]} className='entry-link'>
            <span id='link-to-{this.props.data.n}'>Here</span>
          </a>
        </div>
      </div>
    )
  }
}

/* App
 * - HaveDataOrNot
 * - Get Data
 * - Data
 * - CurrentToView
 * - IndexCreator
 * - Selecter
 * - Searcher
 * - Renderer (CurrentToView)
*/
