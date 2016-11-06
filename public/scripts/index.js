var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;
var Navbar = ReactBootstrap.Navbar;
var Nav = ReactBootstrap.Nav;
var NavItem = ReactBootstrap.NavItem;
var FormGroup = ReactBootstrap.FormGroup;
var FormControl = ReactBootstrap.FormControl;
var ControlLabel = ReactBootstrap.ControlLabel;
var Carousel = ReactBootstrap.Carousel;
var Jumbotron = ReactBootstrap.Jumbotron;

//TO DO when registering, automatically login; format tweet button

var DisplayContainer = React.createClass({
fetchPollsOnLoad: function() {
  var that = this;
  fetch('/polls')
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      var selectedPollId = that.fetchSelectedPoll();
      if (selectedPollId) {
        var selectedPoll = json.data.filter(function(arr, i) {
          return arr.pollId === selectedPollId;
        });
        that.setState({data: json.data})
        that.editSelected(selectedPoll[0]);
      }
      that.setState({data: json.data})
    })
  },

fetchPolls: function() {
  var that = this;
  fetch('/polls')
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      that.setState({data: json.data})
    })
  },

fetchIp: function() {
  var that = this;
  fetch('/checkIp')
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      that.setState({ip: json.ip})
    })
  },

  fetchSelectedPoll: function() {
    if (window.location.search !== "") {
      var queryArr = window.location.search.split('?');
      var selectedPoll = queryArr[1];
      return selectedPoll;
    }
    else {
      return false;
    }
  },

  saveNew: function() {
    var that = this;
    var newId = uuid.v4();
    this.setState({data: that.state.data.concat([{name: that.state.current.name, choices: that.state.current.choices, pollId: newId, creator: that.state.current.creator}])});
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var options = {
      method: 'post',
      body: JSON.stringify({
        name: that.state.current.name,
        choices: that.state.current.choices,
        creator: that.state.user.userName,
        pollId: newId
      }),
      headers: myHeaders
      };
    fetch('/polls', options)
    .then(function(response) {
      that.fetchPolls();
    })
  },

  saveChanges: function() {
    var that = this;
    this.setState({
      data: this.state.data.map(function(selected) {
        if(selected.pollId === that.state.current.pollId) {
          selected.name = that.state.current.name;
          selected.choices = that.state.current.choices;
        }
        return selected;
      })
    });
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var options = {
      method: 'put',
      body: JSON.stringify({
        name: that.state.current.name,
        choices: that.state.current.choices,
      }),
      headers: myHeaders
      };
    fetch('/polls/' + this.state.current.pollId, options)
    .then(function(response) {
      that.fetchPolls();
    });
  },

  saveEdited: function() {
    this.saveChanges();
    this.resetCurrent();
    this.hideModal();
  },

  getInitialState: function() {
    return {data: [],
      view: {showAddModal: false, showEditModal: false, showRegisterModal: false},
      current: {"name": "", "choices": [], "pollId": "", "creator":""}, editing: false,
      user: {"userName": "", "password": "", "loggedIn": false},
      vote: {canVote: true, selected: ""},
      ip: ""
    }
  },




  componentDidMount: function() {
    this.fetchPollsOnLoad();
    this.fetchIp();
  },


  editSelected: function(selected) {
    var that = this;
    var canVote = true;
    selected.choices.map(function(arr, i) {
      arr.responses.map(function(a, j) {
        if (that.state.user.userName !== "") {
          if(a === that.state.user.userName) { canVote = false }
        }
        else {
          if(a === that.state.ip) { canVote = false }
        }
      });
    });
    this.setState({current: {"name": selected.name, "choices": selected.choices, "pollId": selected.pollId, "creator": selected.creator }, vote: {canVote: canVote, selected: that.state.vote.selected}});
    this.showEditModal();
  },

  changeCurrent: function(selected) {
    if (selected.name) {
      this.setState({current: {"name": selected.name, "choices": this.state.current.choices, "pollId": this.state.current.pollId, "creator": this.state.current.creator }});
    }
    else if (selected.choices) {
      var currentChoices = this.state.current.choices;
      var choicesIndex = selected.choices.name.slice(-1);
      currentChoices[choicesIndex] = {"choice": selected.choices.value, "responses": this.state.current.choices[choicesIndex].responses, "choiceId": this.state.current.choices[choicesIndex].choiceId };
      this.setState({current: {"name": this.state.current.name, "choices": currentChoices, "pollId": this.state.current.pollId, "creator": this.state.current.creator }});
    }
  },

  addNew: function(e) {
    e.preventDefault();
    this.resetCurrent();
    this.showAddModal();
  },

  deleteSelected: function(deleted) {
    var that = this;
    this.setState({
      data: this.state.data.filter(function(selected) {return selected.pollId !== deleted })
    });
    // delete from server
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var options = {
      method: 'delete',
      headers: myHeaders
      };
    fetch('/polls/' + deleted, options)
    .then(function(response) {
      that.fetchPolls();
    });
    //reset current and hide modal
    this.resetCurrent();
    this.hideModal();
},
  resetCurrent: function() {
    this.setState({current: {"name": "", "choices": [], "pollId":"", "creator": ""}});
  },

  createNew: function() {
  this.saveNew();
  if (this.state.editing === true) {
    this.setState({editing: false})
  }
  else {
    this.hideModal();
  }

  },


  hideModal(){
        this.setState({view: {showAddModal: false, showEditModal: false, showRegisterModal: false}});
        this.resetCurrent();
        this.setState({editing: false})
  },
  showAddModal(){
        this.setState({view: {showAddModal: true, showEditModal: false}});
  },

  showEditModal(){
        this.setState({view: {showAddModal: false, showEditModal: true, showRegisterModal: false}});
  },

  showRegisterModal(){
        this.setState({view: {showAddModal: false, showEditModal: false, showRegisterModal: true}});
  },

  startEditing(){
    this.setState({editing: true})
  },

  handleChangeUser(e) {
    this.setState({"user": {"userName": e.target.value, "password": this.state.user.password, "loggedIn": false} });
  },

  handleChangePassword(e) {
    this.setState({"user": {"userName": this.state.user.userName, "password": e.target.value, "loggedIn": false } });
  },

  selectChoice(choice) {
    this.setState({"vote": {"canVote": this.state.vote.canVote, "selected": choice } });
  },
  submitChoice(choice) {
    var that = this;
    var choiceArr = choice.split("_");
    var chosen = choiceArr[1];
    var currentChoice = this.state.current.choices.map(function(arr, i) {
      if (arr.choiceId === chosen) {
        if (that.state.user.userName !== "") {
          arr.responses = arr.responses.concat(that.state.user.userName);
        }
        else {
          arr.responses = arr.responses.concat(that.state.ip);
        }

        return arr;
      }
      return arr;
    });
    this.setState({
      "vote": {"canVote": false, "selected": "" },
      current: {
        "name": this.state.current.name,
        "choices": currentChoice
      },
      "pollId": this.state.current.pollId,
      "creator": this.state.current.creator
    });
    this.saveChanges();
  },

  addNewOption() {
    this.setState({
      current: {
        "name": this.state.current.name,
        "choices": this.state.current.choices.concat({
          choice: '',
          responses: [],
          choiceId: uuid.v4()
        }),
        "pollId": this.state.current.pollId,
        "creator": this.state.current.creator
      }
    });
  },


  deleteOption(key) {
    this.setState({
      current: {
        "name": this.state.current.name,
        "choices": this.state.current.choices.filter(function(arr, i) {
            return i !== key;
        }),
        "pollId": this.state.current.pollId,
        "creator": this.state.current.creator
      }
    });

  },


  handleLogout() {
    var that = this;
    fetch('/logout')
      .then(function(response) {
        that.setState({"user": {"userName": "", "password": "", "loggedIn": false } });
      })


  },

  handleLogin(){
    var that = this;
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var options = {
      method: 'post',
      body: JSON.stringify({
        username: that.state.user.userName,
        password: that.state.user.password
      }),
      headers: myHeaders
      };
    fetch('/login', options)
    .then(function(response) {
      if (response.status === 200) {
        that.setState({"user": {"userName": that.state.user.userName, "password": that.state.user.userName, "loggedIn": true } });
      }

    });
  },


  render: function() {
    return (
      <div>
      <Navbar fixedTop>
          <Navbar.Header>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Navbar.Form  pullRight>
            { this.state.user.loggedIn ?
              <div>
              <FormGroup>
              <FormControl.Static className="loggedInUser">{this.state.user.userName} </FormControl.Static>
              </FormGroup>
              <Button onClick={this.handleLogout}>Logout</Button>
              </div>
              :
              <div>
              <FormGroup>
                <FormControl type='text' name="username" placeholder="Username" onChange={this.handleChangeUser} />
                <FormControl type="password" name="password" placeholder="Password" onChange={this.handleChangePassword} />
              </FormGroup>
              <Button onClick={this.handleLogin}>Login</Button>
              <Button onClick={this.showRegisterModal}>Register</Button>
              </div> }
            </Navbar.Form>
          </Navbar.Collapse>
        </Navbar>

          { this.state.user.loggedIn ?
            <div>
            <Jumbotron>
            <h1>Poll Dashboard</h1>
            <p>Welcome back {this.state.user.userName}</p>
          </Jumbotron>
          <div className="col-md-7">
            <h2 className="text-center">Manage My Polls</h2>
            <MyPollList
              data={this.state.data}
              user={this.state.user}
              onEdit={this.editSelected}
              />
              <br/>
              <a href='#' className='list-group-item poll' onClick={this.addNew}>Add New Poll</a>
          </div>
          <div className="col-md-5 text-center">
            <MyPollsCarousel
              data={this.state.data}
              user={this.state.user} />
          </div>
          <div className="col-md-12">
          <br/>
          <h2 className="text-center">Take a Poll</h2>
          <PollList
            data={this.state.data}
            onEdit={this.editSelected}
            user={this.state.user}
            />
            </div>
          </div>
      : <div>
        <Jumbotron>
          <h1>Welcome to Poll Dashboard</h1>
          <p>Take a poll or log in to create a new poll</p>
          <p><Button className="btn btn-register" onClick={this.showRegisterModal}>Register</Button></p>
        </Jumbotron>
        <br/>
          <h2 className="text-center">Take a Poll</h2>
          <PollList
            data={this.state.data}
            onEdit={this.editSelected}
            user={this.state.user}
            /></div> }




        {/* Modal */}
        <DisplayModal
          showAddModal={this.state.view.showAddModal}
          showEditModal={this.state.view.showEditModal}
          current={this.state.current}
          user={this.state.user}
          vote={this.state.vote}
          handleClose={this.hideModal}
          handleAdd={this.showAddModal}
          handleEdit={this.showEditModal}
          handleSave={this.createNew}
          handleSaveEdit={this.saveEdited}
          handleChange={this.changeCurrent}
          handleDelete={this.deleteSelected}
          editing={this.state.editing}
          startEditing={this.startEditing}
          handleAddChoice={this.addNewOption}
          handleDeleteChoice={this.deleteOption}
          handleChoice={this.selectChoice}
          handleSubmitChoice={this.submitChoice}
          />

          {/*Register Modal */}
        <RegisterModal
          showRegisterModal={this.state.view.showRegisterModal}
          handleClose={this.hideModal}
          handleSave={this.createNew}
          />
      </div>
    );
  }
});

var MyPollList = React.createClass({
  render: function() {
    var that = this;
    var myPollNodes = this.props.data.filter(function(arr,i) {return arr.creator === that.props.user.userName} );
    var pollNodes = myPollNodes.map(function(arr, i) {
      return (
          <Poll
            name={arr.name}
            key={arr.pollId}
            creator={arr.creator}
            choices={arr.choices}
            pollId={arr.pollId}
            handleEdit={that.props.onEdit}
             />
      );
    });
    return (
      <div
        className="list-group">
        {pollNodes}
      </div>
    );
  }
});

var MyPollsCarousel = React.createClass({
  render: function() {
    var that = this;
    var myPollNodes = this.props.data.filter(function(arr,i) {return arr.creator === that.props.user.userName} );
    var carouselItems = myPollNodes.map(function(arr, i) {
      return (
        <Carousel.Item>
          <GoogleDonutChart
            graphName={'carousel_graph_' + i}
            key={arr.choices.choiceId}
            choices={arr.choices}
          />
        <Carousel.Caption>
          <h4>{arr.name}</h4>
        </Carousel.Caption>
        </Carousel.Item>
      );
    });
    return (
       <Carousel className="graph-carousel">
          {carouselItems}
       </Carousel>
    );
  }
});




var PollList = React.createClass({
  render: function() {
    var that = this;
    var notMyPollNodes = this.props.data;
    if (this.props.user.loggedIn) {
      var notMyPollNodes = this.props.data.filter(function(arr,i) {return arr.creator !== that.props.user.userName} );
    }
    var pollNodes = notMyPollNodes.map(function(arr, i) {
      return (
          <Poll
            name={arr.name}
            key={arr.pollId}
            choices={arr.choices}
            creator={arr.creator}
            pollId={arr.pollId}
            handleEdit={that.props.onEdit}
             />
      );
    });
    return (
      <div
        className="list-group">
        {pollNodes}
      </div>
    );
  }
});

var Poll = React.createClass({
  handleClick: function() {
    this.props.handleEdit({'name': this.props.name, "choices": this.props.choices, 'pollId': this.props.pollId, 'creator': this.props.creator});
  },


  render: function() {
    return (
        <a
        href='#'
        onClick={this.handleClick}
        className="list-group-item poll"
        >{this.props.name}</a>
    );
  }
});

var RegisterModal = React.createClass({
  close() {
    this.props.handleClose();
  },

  saveNew() {
    this.props.handleSave();
  },

  render() {
    return (
        <Modal className="modal" show={this.props.showRegisterModal} onHide={this.close}>
          <Modal.Header className="modal-header" closeButton>
            <Modal.Title>Register</Modal.Title>
          </Modal.Header>
              <Modal.Body className="modal-body">
              <form action="/register" method="post">
                <FormGroup>
                  <FormControl type='text' name="username" placeholder="Username" />
                  <FormControl type="password" name="password" placeholder="Password" />
                </FormGroup>
                <Button type="submit" className="btn">Register</Button>
              </form>
              </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button onClick={this.close}>Cancel</Button>
          </Modal.Footer>
        </Modal>
    );
  }
});

var PollChoiceList = React.createClass({
  submitChoice() {
    this.props.handleSubmitChoice(this.props.vote.selected);
  },

  render: function() {
    var that = this;
    var pollChoices = this.props.current.choices.map(function(arr, i) {
      return (
          <PollChoice
            choice={arr.choice}
            key={arr.choiceId}
            responses={arr.responses}
            id={arr.choiceId}
            vote={that.props.vote}
            handleChoice={that.props.handleChoice}
             />
      );
    });

    return (
      <div>
        { this.props.vote.canVote ?
        <div>
          <div className="radio">
            {pollChoices}
          </div>
          <button onClick={this.submitChoice}>Vote</button>
        </div>
        :
        <div>
        <GoogleDonutChart
          graphName="test"
          choices={this.props.current.choices}
        />
        </div>
      }
      </div>
    );
  }
});

var GoogleDonutChart = React.createClass({
  render: function(){
    return React.DOM.div({id: this.props.graphName, className: 'carousel-inner'});
  },
  componentDidMount: function(){
    this.checkGoogleChartsLoaded();
  },
  componentDidUpdate: function(){
    this.checkGoogleChartsLoaded();
  },

  checkGoogleChartsLoaded: function() {
    if (google.visualization.PieChart) {
      this.drawCharts();
    }
    else {
      setTimeout(this.checkGoogleChartsLoaded, 50)
    }
  },

  drawCharts: function(){
    var dataArray = [['Choice', 'Responses']];
    this.props.choices.map(function(arr, i) {
      dataArray.push([arr.choice, arr.responses.length])
    });
    var data = google.visualization.arrayToDataTable(dataArray);
    var options = {
      pieHole: 0.4,
      legend: "none",
      backgroundColor: 'transparent',
      pieSliceText: 'label',
      height: 400,
      left: 0
    };

    var chart = new google.visualization.PieChart(
      document.getElementById(this.props.graphName)
    );
    chart.draw(data, options);
  }
});



var PollChoice = React.createClass({
  handleSelect: function(e) {
    this.props.handleChoice(e.target.value);
  },
  render: function() {
    return (
      <div>
        <label>
          <input type="radio" value={'choice_'+ this.props.id} checked={this.props.vote.selected === 'choice_'+ this.props.id} onChange={this.handleSelect} />
          {this.props.choice}
        </label>
        </div>
    );
  }
});





var NewPollChoiceList = React.createClass({

  addChoice: function() {
    this.props.handleAddChoice();
  },

  render: function() {
    var that = this;
    var pollChoices = this.props.current.choices.map(function(arr, i) {
      return (
        <div>
          <NewPollChoice
            choice={arr.choice}
            key={arr.choiceId}
            responses={arr.responses}
            handleDeleteChoice={that.props.handleDeleteChoice}
            handleChange={that.props.handleChange}
            index={i}
             />
             </div>
      );
    });
    return (
      <div>
        {pollChoices}
        <button onClick={that.addChoice}>+</button>
      </div>
    );
  }
});

var NewPollChoice = React.createClass({
  deleteChoice: function() {
    this.props.handleDeleteChoice(this.props.index);
  },
  changeChoice(e) {
    this.props.handleChange({"choices": e.target});
  },


  render: function() {
    return (
      <div>
        <input type="text" name={'choice_'+ this.props.index} defaultValue={this.props.choice} onChange={this.changeChoice}></input>
        <button onClick={this.deleteChoice}>-</button>
      </div>
    );
  }
});






var DisplayModal = React.createClass({
  close() {
    this.props.handleClose();
  },

  saveNew() {
    this.props.handleSave();
  },

  saveEdit() {
    this.props.handleSaveEdit(this.props.current);
  },

  deleteSelected() {
    this.props.handleDelete(this.props.current.pollId);
  },

  startEditing() {
    this.props.startEditing();
  },

  handleChangeName(e) {
    this.props.handleChange({"name": e.target.value});
  },


  render() {
    return (
    <div>
      {/* Add Modal */}
      <div>
        <Modal className="modal" show={this.props.showAddModal} onHide={this.close}>
          <Modal.Header className="modal-header" closeButton>
            <Modal.Title>Add Poll</Modal.Title>
          </Modal.Header>
              <Modal.Body className="modal-body">
                <h4>Poll Name</h4>
                <input type='text' className="input-lg name-input" onChange={this.handleChangeName} placeholder="Poll Name" ></input>
                <h4>Add Choices</h4>
                <NewPollChoiceList
                    current={this.props.current}
                    handleAddChoice={this.props.handleAddChoice}
                    handleDeleteChoice={this.props.handleDeleteChoice}
                    handleChange={this.props.handleChange} />
              </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button onClick={this.saveNew}>Save</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
        </div>

      {/* Edit Modal */}
      <div>
        <Modal className="modal" show={this.props.showEditModal} onHide={this.close}>
          <Modal.Header className="modal-header" closeButton>
          { this.props.editing ?
            <Modal.Title>Edit Poll</Modal.Title>
            :
            <Modal.Title>{this.props.current.name}</Modal.Title> }
          </Modal.Header>

          { this.props.editing ?
             <Modal.Body className="modal-body">
              <h4>Poll Name</h4>
              <input type='text' className="input-lg name-input" onChange={this.handleChangeName} defaultValue={this.props.current.name} ></input>
              <h4>Edit Choices</h4>
              <NewPollChoiceList
                  current={this.props.current}
                  handleAddChoice={this.props.handleAddChoice}
                  handleDeleteChoice={this.props.handleDeleteChoice}
                  handleChange={this.props.handleChange} />
             </Modal.Body>
           :
           <Modal.Body className="modal-body">
             <PollChoiceList
                 current={this.props.current}
                 vote={this.props.vote}
                 handleChoice={this.props.handleChoice}
                 handleSubmitChoice={this.props.handleSubmitChoice}/>
             </Modal.Body> }

          <Modal.Footer className="modal-footer">
          { this.props.editing ?
            <div>
              <Button className="pull-left" onClick={this.deleteSelected}>Delete</Button>
              <Button onClick={this.saveEdit}>Save</Button>
              <Button onClick={this.close}>Close</Button>
            </div>
            :
            <div>
            { this.props.current.creator === this.props.user.userName ?
              <div>
                <a
                  href={'https://twitter.com/intent/tweet?text=Check%20out%20this%20poll: ' + window.location.hostname + '/?' + this.props.current.pollId}
                  className="fa fa-lg fa-twitter-square twitter-share-button pull-left"
                  ></a>
                <Button onClick={this.startEditing}>Edit</Button>
                <Button onClick={this.close}>Close</Button>
              </div>

              : <div><Button onClick={this.close}>Close</Button></div> }

            </div> }
          </Modal.Footer>
        </Modal>
      </div>
      </div>

    );
  }
});



ReactDOM.render(
  <DisplayContainer  />,
  document.getElementById('app')
);
