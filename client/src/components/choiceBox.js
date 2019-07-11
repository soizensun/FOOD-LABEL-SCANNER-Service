import React from 'react';
import MaterialTable from 'material-table'
import Select from 'react-select';
import '../cssFile/choiceBox.css';

const options = [
    { label: 'Top supermarket', value: 'Top'  },
    { label: 'Tessco market', value: 'Tessco'  },
  ];
   
  class ChoiceBox extends React.Component {
    state = {
      selectedOption: null,
      goodTotal: [],
      errorPromt: ""
    }

    componentDidMount(){
      fetch('./loadTable')
        .then((res) => res.json())
        .then((goodTotal) => this.setState({goodTotal}, () => console.log('reload table', goodTotal)));
    }

    handleChange = (selectedOption) => {
      this.setState({ selectedOption });
      console.log(`Option selected:`, selectedOption.value);
    }
    
    handleButton = () => {
      if (this.state.selectedOption === null){
        this.setState({errorPromt: "Please select market !!!"})
        return;
      } 
      const value = this.state.selectedOption.value

      if (value === 'Tessco'){
        this.setState({errorPromt: ""})
        fetch('./tesscoProcessFormat')
          .then((res) => res.json())
          .then((goodTotal) => this.setState({goodTotal}, () => console.log('good Tessco fetched...', goodTotal)));
      }
      if (value === 'Top'){
        this.setState({errorPromt: ""})
        fetch('./topProcessFormat')
          .then((res) => res.json())
          .then((goodTotal) => this.setState({goodTotal}, () => console.log('good Top fetched...', goodTotal)));  
      }

    }

    render() {
      const { selectedOption } = this.state;
      return (
        <div>
          <div>{this.state.errorPromt}</div>
          <Select className="select" value={selectedOption} onChange={this.handleChange} options={options}/>
          <button onClick = {this.handleButton} className = "selectionButton"> PROCESS </button>

          <br/><br/><div className="labelSelectZone"> 3. Your result </div><br/>

          <div className="table">
            <MaterialTable
              columns={[
                { title: 'Market', field: 'market' },
                { title: 'Name', field: 'name' },
                { title: 'Expiry Date', field: 'exDate'},
                { title: 'Net Weight', field: 'netWeight'},               
              ]}
              data = {this.state.goodTotal}
              title=" Your result " 
            />
          </div>
        </div>
      );
    }
  }

  export default ChoiceBox;