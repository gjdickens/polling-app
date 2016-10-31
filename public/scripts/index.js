var Button = ReactBootstrap.Button;
var Modal = ReactBootstrap.Modal;

var DisplayContainer = React.createClass({
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

  saveNew: function() {
    var that = this;
    var newId = uuid.v4();
    this.setState({data: that.state.data.concat([{name: that.state.current.name, choices: that.state.current.choices, pollId: newId}])});
    var myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');
    var options = {
      method: 'post',
      body: JSON.stringify({
        name: that.state.current.name,
        choices: that.state.current.choices,
        pollId: newId
      }),
      headers: myHeaders
      };
    fetch('/polls', options)
    .then(function(response) {
      that.fetchPolls();
    })
  },

  saveEdited: function(edited) {
    var that = this;
    this.setState({
      data: this.state.data.map(function(selected) {
        if(selected.pollId === edited.pollId) {
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
    fetch('/polls/' + edited.pollId, options)
    .then(function(response) {
      that.fetchPolls();
    });
    this.resetCurrent();
    this.hideModal();
  },

  getInitialState: function() {
    return {data: [], view: {showAddModal: false, showEditModal: false}, current: {"name": "", "choices": "", "pollId": ""}, editing: false}
  },


  componentDidMount: function() {
    this.fetchPolls();
  },

  editSelected: function(selected) {
    this.setState({current: {"name": selected.name, "choices": selected.choices, "pollId": selected.pollId }});
    this.showEditModal();
  },

  changeCurrent: function(selected) {
    if (selected.name) {
      this.setState({current: {"name": selected.name, "choices": this.state.current.choices, "pollId": this.state.current.pollId }});
    }
    else if (selected.choices) {
      this.setState({current: {"name": this.state.current.name, "choices": selected.choices, "pollId": this.state.current.pollId }});
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
    this.setState({current: {"name": "", "choices": "", "pollId":""}});
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
        this.setState({view: {showAddModal: false, showEditModal: false}});
        this.resetCurrent();
        this.setState({editing: false})
  },
  showAddModal(){
        this.setState({view: {showAddModal: true, showEditModal: false}});
  },

  showEditModal(){
        this.setState({view: {showAddModal: false, showEditModal: true}});
  },

  startEditing(){
    this.setState({editing: true})
  },


  render: function() {
    return (
      <div>
        <h2 className="text-center">Polls</h2>
        <a href='#' className='list-group-item recipe' onClick={this.addNew}>Add New Poll</a>
        <br/>
        <RecipeList
          data={this.state.data}
          onEdit={this.editSelected}
          />



        {/* Modal */}
        <DisplayModal
          showAddModal={this.state.view.showAddModal}
          showEditModal={this.state.view.showEditModal}
          current={this.state.current}
          handleClose={this.hideModal}
          handleAdd={this.showAddModal}
          handleEdit={this.showEditModal}
          handleSave={this.createNew}
          handleSaveEdit={this.saveEdited}
          handleChange={this.changeCurrent}
          handleDelete={this.deleteSelected}
          editing={this.state.editing}
          startEditing={this.startEditing}
          />
      </div>
    );
  }
});




var RecipeList = React.createClass({
  render: function() {
    var that = this;
    var recipeNodes = this.props.data.map(function(arr, i) {
      return (
          <Recipe
            name={arr.name}
            key={arr.pollId}
            choices={arr.choices}
            pollId={arr.pollId}
            handleEdit={that.props.onEdit}
             />
      );
    });
    return (
      <div
        className="list-group">
        {recipeNodes}
      </div>
    );
  }
});

var Recipe = React.createClass({
  handleClick: function() {
    this.props.handleEdit({'name': this.props.name, 'choices': this.props.choices, 'pollId': this.props.pollId});
  },


  render: function() {
    return (
        <a
        href="#"
        onClick={this.handleClick}
        className="list-group-item recipe"
        >{this.props.name}</a>
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

  handleChangeChoices(e) {
    this.props.handleChange({"choices": e.target.value});
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
                <h4>Choices</h4>
                <textarea className="ingredient-input" onChange={this.handleChangeChoices} placeholder="Choices" ></textarea>
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
              <h4>Choices</h4>
              <textarea className="ingredient-input" onChange={this.handleChangeChoices} defaultValue={this.props.current.choices} ></textarea>
             </Modal.Body>
           :
           <Modal.Body className="modal-body">
             <h4>Choices</h4>
             <p>{this.props.current.choices}</p>
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
              <Button onClick={this.startEditing}>Edit</Button>
              <Button onClick={this.close}>Close</Button>
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
