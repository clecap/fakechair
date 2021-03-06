import React from 'react'
import ConferenceContract from '../build/contracts/Conference.json'
import getWeb3 from './utils/getWeb3'
import multihash from './utils/multihash';
import Paper from './paper'
import cleanTitle from './utils/cleanTitle'

import Button from 'react-bootstrap/lib/Button';
import Form from 'react-bootstrap/lib/Form';





class ShowPaper extends React.Component{



	constructor(props){
		super(props);
		this.state={
      web3: null,
      conferenceAddress:'',
      paperHash: [],
      title:[],
      paperLength:'',
      cleanConfTitle:'',
      paperAddresses: []

		};
	}

  componentWillMount() {
      getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        })

      })
      .catch(() => {
        console.log('Error finding web3.')
      })
  }

  /*
  Show the requested conference's details on button click.
   */
  showPaper = async () =>  {
    this.setState({paperLength: '...waiting'})

    const contract = require('truffle-contract')
    let conference = contract(ConferenceContract);
    conference.setProvider(this.state.web3.currentProvider)

    // Get accounts.
    const accounts = await this.state.web3.eth.getAccounts() 

    // get conference instance
    const conferenceInstance = await conference.at(this.state.conferenceAddress)

    const paperLength = await conferenceInstance.getPaperLength({from: accounts[0]})
    console.log(paperLength.c[0])
    this.setState({paperLength: paperLength.c[0]})
    
    const confTitle = await conferenceInstance.title({from: accounts[0]})
    const cleanConfTitle = cleanTitle(confTitle)
    this.setState({cleanConfTitle})


    const cleanTitles = [];
    const hashes = [];
    const paperAddresses = [];

    for (let i = 0; i < this.state.paperLength; i += 1) {

      let paper = await conferenceInstance.getPaperByIndex(i,{from: accounts[0]})
      //let author = paper[1];

      paperAddresses[i] = paper[0];
      cleanTitles[i] = cleanTitle(paper[2]); 
      hashes[i] = multihash.getMultihashFromContractResponse([paper[3].toString(), paper[4].c[0].toString(), paper[5].c[0].toString()])
      this.props.getConferenceForPapers(paperAddresses[i],this.state.conferenceAddress);
    };

    this.setState({paperHash: hashes, title: cleanTitles, paperAddresses: paperAddresses})
  }


	render(){
    const children = [];

    for (var i = 0; i < this.state.paperLength; i += 1) {

      children.push( <Paper key={i} number={i} address={this.state.paperAddresses[i]} confTitle={this.state.cleanConfTitle} hash={this.state.paperHash[i]} title={this.state.title[i]} />);
    };

		return(

			<div className='container'>
      <p>No. of paper: {this.state.paperLength}</p>
      <Form>
        <input value={this.state.conferenceAddress} onChange={evt => this.setState({conferenceAddress: evt.target.value})} type="text" className="form-control" id="formGroupExampleInput" placeholder="Conference Address"></input>
        <Button bsStyle="primary"  onClick={this.showPaper}> Show </Button>
      </Form>
        <div className="row">
          {children}

        </div>
      </div>
		);
	}
}




export default ShowPaper