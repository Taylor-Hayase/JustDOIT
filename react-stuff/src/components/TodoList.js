import React, { Component } from "react";
import "./TodoList.css";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./DataStore.js";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

class TodoList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      items: [],
      user: "",
    };

    this.addItem = this.addItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.createTasks = this.createTasks.bind(this);
    this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorderedItems = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.makePatchCall(reorderedItems).then((callResult) => {
      this.setState((prevState) => {
        return {
          items: reorderedItems,
        };
      });
    });
  }

  makePatchCall(items) {
    var html = "http://localhost:5000/list/" + this.props.id + "/";
    return axios
      .patch(html, items)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return false;
      });
  }

  addItem(e) {
    if (this._inputElement.value !== "") {
      if (this._inputTime.value !== "") {
        this._inputTime.value = "due: " + this._inputTime.value;
      }
      var newItem = {
        text: this._inputElement.value,
        key: Date.now(),
        checked: false,
        due: this._inputTime.value,
      };
      this.makePostCall(newItem).then((callResult) => {
        this.setState((prevState) => {
          return {
            items: prevState.items.concat(newItem),
          };
        });
        this._inputElement.value = "";
        this._inputTime.value = "";
      });
      e.preventDefault();
    }
  }

  makePostCall(item) {
    console.log(item);
    var html =
      "http://localhost:5000/list/" + this.props.id + "/" + item.key + "/";
    return axios
      .post(html, item)
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return false;
      });
  }

  deleteItem(key) {
    var filteredItems = this.state.items.filter(function (item) {
      return item.key !== key;
    });
    this.setState({
      items: filteredItems,
    });
  }

  delete(key) {
    this.makeDeleteCall(key).then((callResult) => {
      this.deleteItem(key);
    });
  }
  makeDeleteCall(key) {
    //for item
    var html = "http://localhost:5000/list/" + this.props.id + "/";
    return axios
      .delete(html.concat(key + "/"))
      .then(function (response) {
        return response;
      })
      .catch(function (error) {
        return false;
      });
  }

  forceUpdateHandler() {
    this.forceUpdate();
  }

  handleClick = (key) => {
    var i;
    for (i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i].key === key) {
        if (this.state.items[i].checked === true) {
          let items = [...this.state.items];
          items[i].checked = false;
          this.setState({ items });
        } else {
          let items = [...this.state.items];
          items[i].checked = true;
          this.setState({ items });
        }
        this.makePatchCall(this.state.items).then((callResult) => {
          this.setState((prevState) => {
            return {
              items: this.state.items,
            };
          });
        });
      }
    }
    this.forceUpdateHandler();
  };

  handleButtonClick = () => {
    if (this.props.rend === true) {
      var i;
      for (i = 0; i < this.state.items.length; i++) {
        this.delete(this.state.items[i].key);
      }
      var html = "http://localhost:5000/list/" + this.props.id + "/";
      return axios
        .delete(html)
        .then(function (response) {
          return response;
        })
        .catch(function (error) {
          return false;
        });
    }
  };

  createTasks(item) {
    if (item.checked === true) {
      return (
        <div>
          <li
            onClick={() => this.handleClick(item.key)}
            className="checked"
            key={item.key}
          >
            {item.text + "\t" + item.due}
            <button onClick={() => this.delete(item.key)} className="button">
              Remove
            </button>
          </li>
        </div>
      );
    } else {
      return (
        <div>
          <li onClick={() => this.handleClick(item.key)} key={item.key}>
            {item.text + "\t" + item.due}
            <button onClick={() => this.delete(item.key)} className="button">
              Remove
            </button>
          </li>
        </div>
      );
    }
  }

  componentDidMount() {
    this.setState({ user: window.user_id });
    var html = "http://localhost:5000/list/" + this.props.id + "/";
    axios
      .get(html)
      .then((res) => {
        const items = res.data;
        this.setState({ items: items });
        if (this.items.length !== 0) {
          this.setState({ rend: true });
        } else {
          this.setState({ rend: false });
        }
      })
      .catch(function (error) {
        //Not handling the error. Just logging into the console.
        console.log(error);
      });
  }

  render() {
    var listName = this.props.name;
    return (
      <div>
        {this.props.rend && (
          <div>
            <div className="todoListMain">
              <div className="header">
                <div>
                  <h3>{listName}</h3>
                </div>
                <form onSubmit={this.addItem}>
                  <input
                    type="text"
                    ref={(a) => (this._inputElement = a)}
                    placeholder="enter task"
                  ></input>
                  <input
                    type="text"
                    ref={(a) => (this._inputTime = a)}
                    placeholder="enter due date"
                  ></input>
                  <button type="submit">Add</button>
                  <button onClick={this.handleButtonClick}>Delete List</button>
                </form>
              </div>

              <DragDropContext onDragEnd={this.onDragEnd}>
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {this.state.items.map((item, index) => (
                        <Draggable
                          key={item.key.toString()}
                          draggableId={item.key.toString()}
                          index={index}
                        >
                          {(provided, spanshot) => (
                            <div
                              className="theList"
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                            >
                              {this.createTasks(item)}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TodoList;
