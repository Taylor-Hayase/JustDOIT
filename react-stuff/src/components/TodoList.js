import React, { Component } from "react";
import "./TodoList.css";
import axios from "axios";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";


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

    this.makePatchCall(reorderedItems).then ((callResult) => {
      this.setState((prevState) => {
        return {
          items: reorderedItems,
        };
      });
    });
  }

  makePatchCall(items) {
    return axios
      .patch("http://localhost:5000/list/1", items)
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });
  }

  addItem(e) {
    if (this._inputElement.value !== "") {
      var newItem = {
        text: this._inputElement.value,
        key: Date.now(),
        checked: false,
      };
      this.makePostCall(newItem).then((callResult) => {
        this.setState((prevState) => {
          return {
            items: prevState.items.concat(newItem),
          };
        });
        this._inputElement.value = "";
      });
      console.log(this.state.items);
      e.preventDefault();
    }
  }

  makePostCall(item) {
    return axios
      .post("http://localhost:5000/list/1", item)
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
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
  forceUpdateHandler() {
    this.forceUpdate();
  }

  handleClick = (key) => {
    var i;
    for (i = 0; i < this.state.items.length; i++) {
      if (this.state.items[i].key === key) {
        if (this.state.items[i].checked === true) {
          this.state.items[i].checked = false;
        } else {
              console.log("called");
          this.state.items[i].checked = true;
        }
      }
    }
    this.forceUpdateHandler();
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
            {item.text}
          </li>
          <button
            onClick={() => this.delete(item.key)}
            className="btn btn-lg btn-outline-danger ml-4"
          >
            Remove
          </button>
        </div>
      );
    } else {
      return (
        <div>
          <li onClick={() => this.handleClick(item.key)} key={item.key}>
            {item.text}
          </li>
          <button
            onClick={() => this.delete(item.key)}
            className="btn btn-lg btn-outline-danger ml-4"
          >
            Remove
          </button>
        </div>
      );
    }
  }

  makeDeleteCall(key) {
    return axios
      .delete("http://localhost:5000/list/1/".concat(key))
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (error) {
        console.log(error);
        return false;
      });
  }

  componentDidMount() {
    axios
      .get("http://localhost:5000/list/1")
      .then((res) => {
        const items = res.data.users_list;
        this.setState({ items });
      })
      .catch(function (error) {
        //Not handling the error. Just logging into the console.
        console.log(error);
      });
  }

  render() {

    var todoEntries = this.state.items;
    var listItems = todoEntries.map(this.createTasks);


    return (
      <div className="todoListMain">
        <div className="header">
          <form onSubmit={this.addItem}>
            <input
              ref={(a) => (this._inputElement = a)}
              placeholder="enter task"
            ></input>
            <button type="submit">Add</button>
          </form>
        </div>

        <DragDropContext onDragEnd={this.onDragEnd}>
          <Droppable droppableId="droppable">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
        
            >
            {this.state.items.map((item, index) => (
              <Draggable key={item.key.toString()} draggableId={item.key.toString()} index={index}>
                {(provided, spanshot) => (
                  <div className="theList"
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
    );
  }
}

export default TodoList;