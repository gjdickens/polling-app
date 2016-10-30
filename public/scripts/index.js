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

  getInitialState: function() {
    return {data: [], view: {showAddModal: false, showEditModal: false}, current: {"name": "", "ingredients": ""}, editing: false}
  },


  componentDidMount: function() {
    this.fetchPolls();
  },


  editRecipe: function(name) {
    this.setState({current: {"name": name.name, "ingredients": name.ingredients}});
    this.showEditModal();
  },

  changeCurrent: function(recipe) {
    if (recipe.name) {
      this.setState({current: {"name": recipe.name, "ingredients": this.state.current.ingredients}});
    }
    else if (recipe.ingredients) {
      this.setState({current: {"name": this.state.current.name, "ingredients": recipe.ingredients}});
    }
  },

  addRecipe: function(e) {
    e.preventDefault();
    this.setState({current: {"name": "", "ingredients": ""}});
    this.showAddModal();
  },

  deleteRecipe: function() {
    var that = this;
    this.setState({
      data: this.state.data.filter(function(recipe) {return recipe.name !== that.state.current.name })
    });

    this.setState({current: {"name": "", "ingredients": ""}});
    this.hideModal();
},

  createRecipe: function() {
  var that = this;
  var exists = this.state.data.filter(function(recipe) { return recipe.name === that.state.current.name });
  if (exists.length > 0) {
    this.setState({
      data: this.state.data.map(function(recipe) {
        if (recipe.name === that.state.current.name) {
          recipe.name = that.state.current.name;
          recipe.ingredients = that.state.current.ingredients;
          return recipe;
        }
        else {
          return recipe;
        }
      })
    });
  }
  else {
    this.setState({
      data: this.state.data.concat([{
        name: this.state.current.name,
        ingredients: this.state.current.ingredients
      }])
    });
  }
  if (this.state.editing === true) {
    this.setState({editing: false})
  }
  else {
    this.hideModal();
  }

  },



  hideModal(){
        this.setState({view: {showAddModal: false, showEditModal: false}});
        this.setState({current: {"name": "", "ingredients": ""}});
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
        <h2 className="text-center">Recipes</h2>
        <RecipeList
          data={this.state.data}
          onEdit={this.editRecipe}
          />

        <a href='#' className='list-group-item recipe' onClick={this.addRecipe}>Add New Recipe</a>

        {/* Modal */}
        <DisplayModal
          showAddModal={this.state.view.showAddModal}
          showEditModal={this.state.view.showEditModal}
          current={this.state.current}
          handleClose={this.hideModal}
          handleAdd={this.showAddModal}
          handleEdit={this.showEditModal}
          handleSave={this.createRecipe}
          handleChange={this.changeCurrent}
          handleDelete={this.deleteRecipe}
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
    var recipeNodes = this.props.data.map(function(recipe, i) {
      return (
          <Recipe
            name={recipe.name}
            key={i}
            ingredients={recipe.ingredients}
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
    this.props.handleEdit({'name': this.props.name, 'ingredients': this.props.ingredients});
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

  save() {
    this.props.handleSave();
  },

  deleteRecipe() {
    this.props.handleDelete();
  },

  startEditing() {
    this.props.startEditing();
  },

  handleChangeRecipe(e) {
    this.props.handleChange({"name": e.target.value});
  },

  handleChangeIngredient(e) {
    this.props.handleChange({"ingredients": e.target.value});
  },

  render() {
    return (
    <div>
      {/* Add Modal */}
      <div>
        <Modal className="modal" show={this.props.showAddModal} onHide={this.close}>
          <Modal.Header className="modal-header" closeButton>
            <Modal.Title>Add Recipe</Modal.Title>
          </Modal.Header>
              <Modal.Body className="modal-body">
                <h4>Recipe Name</h4>
                <input type='text' className="input-lg name-input" onChange={this.handleChangeRecipe} placeholder="Recipe Name" ></input>
                <h4>Ingredients</h4>
                <textarea className="ingredient-input" onChange={this.handleChangeIngredient} placeholder="Ingredients" ></textarea>
              </Modal.Body>
          <Modal.Footer className="modal-footer">
            <Button onClick={this.save}>Save</Button>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
        </div>

      {/* Edit Modal */}
      <div>
        <Modal className="modal" show={this.props.showEditModal} onHide={this.close}>
          <Modal.Header className="modal-header" closeButton>
          { this.props.editing ?
            <Modal.Title>Edit Recipe</Modal.Title>
            :
            <Modal.Title>{this.props.current.name}</Modal.Title> }
          </Modal.Header>

          { this.props.editing ?
             <Modal.Body className="modal-body">
              <h4>Recipe Name</h4>
              <input type='text' className="input-lg name-input" onChange={this.handleChangeRecipe} defaultValue={this.props.current.name} ></input>
              <h4>Ingredients</h4>
              <textarea className="ingredient-input" onChange={this.handleChangeIngredient} defaultValue={this.props.current.ingredients} ></textarea>
             </Modal.Body>
           :
           <Modal.Body className="modal-body">
             <h4>Ingredients</h4>
             <p>{this.props.current.ingredients}</p>
             </Modal.Body> }

          <Modal.Footer className="modal-footer">
          { this.props.editing ?
            <div>
              <Button className="pull-left" onClick={this.deleteRecipe}>Delete</Button>
              <Button onClick={this.save}>Save</Button>
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
