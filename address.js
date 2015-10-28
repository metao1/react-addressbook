var PropTypes = React.PropTypes;

// address Model
// ----------

// Our basic **address** model has `title` and `number` attributes.
var Address = Backbone.Model.extend({
    // Default attributes for the address item.
    defaults: function () {
        return {
            title: "",
            number: ""
        };
    }
});

// address Collection
// ---------------

// The collection of address is backed by *localStorage* instead of a remote
// server.
var AddressList = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Address,

    // Save all of the address items under the `"address-react"` namespace.
    localStorage: new Backbone.LocalStorage("address-react"),

    search: function (letters) {
        var pattern = new RegExp(letters, "gi");
        return _(this.filter(function (data) {
            return pattern.test(data.get("title")) || pattern.test(data.get("number"));
        }));
    }
});

// Backbone/React Integration
// --------------------------

// Updates React components when their Backbone resources change. Expects the
// component to implement a method called `getResource` that returns an object
// that extends `Backbone.Events`.
var BackboneMixin = {

    // Listen to all events on this component's collection or model and force an
    // update when they fire. Let React decide whether the DOM should change.
    componentDidMount: function () {
        this._boundForceUpdate = this.forceUpdate.bind(this, null);
        this.getResource().on("all", this._boundForceUpdate, this);
    },

    // Clean up the listener when the component will be removed.
    componentWillUnmount: function () {
        this.getResource().off("all", this._boundForceUpdate);
    }
};

// address List Item Component
// ------------------------

// The DOM for a address item...
var AddressListItemComponent = React.createClass({

    propTypes: {
        editing: PropTypes.bool.isRequired,
        model: PropTypes.object.isRequired,
        onStartEditing: PropTypes.func.isRequired,
        onStopEditing: PropTypes.func.isRequired,
    },

    // If the component updates and is in edit mode, send focus to the `<input>`.
    componentDidUpdate: function (prevProps) {
        if (this.props.editing && !prevProps.editing) {
            //  React.findDOMNode(this.refs.editInput).focus();
        }
    },

    // Destroying the model fires a `remove` event on the model's collection,
    // which forces an update and removes this **AddressListItemComponent** from the
    // DOM. We don't have to do any other cleanup!
    destroy: function () {
        this.props.model.destroy();
    },

    // Stop editing if the input gets an "Enter" keypress.
    handleEditKeyPress: function (event) {
        if (13 === event.keyCode) {
            this.stopEditing();
        }
    },

    render: function () {
        var inputStyles = {};
        var viewStyles = {};

        // Hide the `.view` when editing
        if (this.props.editing) {
            viewStyles.display = "none";

            // ... and hide the `<input>` when not editing
        } else {
            inputStyles.display = "none";
        }

        return (
            <tr>
                <td>
                    <label className="view highlight" style={viewStyles}>{this.props.model.get("title")}</label>
                    <input className="edit" ref="editInput" type="text"
                           onBlur={this.stopEditing}
                           onChange={this.setTitle}
                           onKeyPress={this.handleEditKeyPress}
                           style={inputStyles}
                           value={this.props.model.get("title")}/>
                </td>
                <td>
                    <label className="view highlight" style={viewStyles}>{this.props.model.get("number")}</label>
                    <input className="edit" ref="editInput" type="text"
                           onBlur={this.stopEditing}
                           onChange={this.setNumber}
                           onKeyPress={this.handleEditKeyPress}
                           style={inputStyles}
                           value={this.props.model.get("number")}/>
                </td>

                <td>
                    <input type="button" value="حذف" className="btn dang" onClick={this.destroy}></input>
                </td>
                <td>
                    <input type="button" value="اصلاح" className="btn warn" onClick={this.startEditing}></input>
                </td>

            </tr>
        );
    },

    // Set the title of this item's model when the value of the `<input>` changes.
    setTitle: function (event) {
        this.props.model.set("title", event.target.value);
    },

    // Set the number of this item's model when the value of the `<input>` changes.
    setNumber: function (event) {
        this.props.model.set("number", event.target.value);
    },

    // Tell the parent component this list item is entering edit mode.
    startEditing: function () {
        this.props.onStartEditing(this.props.model.id);
    },

    // Exit edit mode.
    stopEditing: function () {
        this.props.onStopEditing(this.props.model.id);
    }

});

// address List Component
// -------------------

// Renders a list of address.
var AddressListComponent = React.createClass({

    propTypes: {
        collection: PropTypes.object.isRequired
    },

    // Start with no list item in edit mode.
    getInitialState: function () {
        return {
            editingModelId: null
        };
    },

    // When a `AddressListItemComponent` starts editing, it passes its model's ID to
    // this callback. Setting the state triggers this component to re-render and
    // render that `AddressListItemComponent` in edit mode.
    setEditingModelId: function (modelId) {
        this.setState({editingModelId: modelId});
    },

    unsetEditingModelId: function (modelId) {
        if (modelId === this.state.editingModelId) {
            this.setState({editingModelId: null});
        }
    },

    render: function () {
        var rows = this.props.collection
            .map(function (model) {
                return (
                    <AddressListItemComponent
                        editing={this.state.editingModelId === model.id}
                        key={model.id}
                        model={model}
                        onStartEditing={this.setEditingModelId}
                        onStopEditing={this.unsetEditingModelId}/>
                );
            }, this);
        return (
            <table id="address-list" className="table table-bordered">
                <thead>
                <th>نام</th>
                <th>شماره</th>
                <th></th>
                <th></th>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        );
    }
});

// Footer Component
// ----------------

// The footer shows the total number of address and how many are completed.
var FooterComponent = React.createClass({

    propTypes: {
        itemsDoneCount: PropTypes.number.isRequired,
        itemsRemainingCount: PropTypes.number.isRequired,
    },

    render: function () {
        var clearCompletedButton;

        // Show the "Clear X completed items" button only if there are completed
        // items.
        if (this.props.itemsDoneCount > 0) {
            clearCompletedButton = (
                <a id="clear-completed" onClick={this.props.clearCompletedItems}>
                    Clear {this.props.itemsDoneCount} completed
                    {1 === this.props.itemsDoneCount ? " نفر" : " نفر"}
                </a>
            );
        }

        // Clicking the "Clear X completed items" button calls the
        // "clearCompletedItems" function passed in on `props`.
        return (
            <footer>
                {clearCompletedButton}
                <div className="address-count">
                    <b>{this.props.itemsRemainingCount}</b>
                    {1 === this.props.itemsRemainingCount ? " نفر" : " نفر"}
                    موجود
                </div>
            </footer>
        );
    }

});

//Search Component
//---------------

var SearchBar = React.createClass({
    handleChange: function () {
        this.props.onUserInput(
            this.refs.filterTextInput.getDOMNode().value
        );
    },
    render: function () {
        return (
            <div className="row ">
                <div className="col-lg-4 col-lg-offset-4">
                    <form onSubmit={this.handleSubmit}>
                        <input ref="filterTextInput" value={this.props.filterText} onChange={this.handleChange}
                               type="search" className="form-control" placeholder="جستجو"/>
                    </form>
                </div>
            </div>
        );
    }
});


// Main Component
// --------------

// The main component contains the list of address and the footer.
var MainComponent = React.createClass({

    propTypes: {
        clearCompletedItems: PropTypes.func.isRequired,
        collection: PropTypes.object.isRequired,
        toggleAllItemsCompleted: PropTypes.func.isRequired,
    },

    // Tell the **App** to toggle the *done* state of all **address** items.
    toggleAllItemsCompleted: function (event) {
        this.props.toggleAllItemsCompleted(event.target.checked);
    },

    render: function () {
        if (0 === this.props.collection.length) {
            // Don't display the "Mark all as complete" button and the footer if there
            // are no **address** items.
            return null;
        } else {
            return (
                <section id="main">
                    <AddressListComponent collection={this.props.collection}/>
                    <FooterComponent
                        itemsRemainingCount={this.props.collection.where({done:false})}
                        />
                </section>
            );
        }
    }

});

var AppComponent = React.createClass({

    propTypes: {
        collection: PropTypes.object.isRequired,
    },

    // Clear all done address items, destroying their models.
    clearCompletedItems: function () {
        _.invoke(this.props.collection.done(), "destroy");
    },

    // Fetch address before the App is rendered to the DOM.
    componentWillMount: function () {
        this.props.collection.fetch();
    },

    // Start the app with a blank `<input>`.
    getInitialState: function () {
        //simulator.onConnect(function (callback) {
        //    console.log('connected to server');
        //    // this.setState({status: "online"});
        //});
        //simulator.onDisconnect(function (callback) {
        //    console.log('disconnected from server');
        //    //  this.setState({status: "offline"});
        //});
        //var members = {};
        //simulator.onChange(function (member) {
        //    //for(var i=0; i< members.length ;i++) {
        //    //    this.props.collection.create({title: members[i].title, number: members[i].number});
        //    //}
        //    members[member.title] = member;
        //    console.log(members);
        //}.bind(this));

        return {collection: this.props.collection};
    },

    // Used by the **BackboneMixin** to watch for changes on this component's
    // resource.
    getResource: function () {
        return this.props.collection;
    },

    handleStateChange: function (value) {
        this.setState({status: value});
    },

    componentWillUnmount: function () {
        clearInterval(this.interval);
    },

    // Set the state of the title when the `<input>` is changed.
    handleTitleChange: function (event) {
        this.setState({title: event.target.value});
    },

    // Set the state of the number when the `<input>` is changed.
    handleNumberChange: function (event) {
        this.setState({number: event.target.value});
    },

    tick: function () {
        if (this.state.secondsElapsed === 3) {
            this.setState({secondsElapsed: 0});
        } else {
            this.setState({secondsElapsed: this.state.secondsElapsed + 1});
        }
    },

    componentDidMount: function () {
        this.interval = setInterval(this.tick, 1000);
        this.setState({status: "offline"});
    },

    // If "Enter" is pressed in the main input field, it will submit the form.
    // Create a new **address** in *localStorage* and reset the title.
    handleTitleFormSubmit: function (event) {
        event.preventDefault();

        if ("" === this.state.title) return;

        this.props.collection.create({title: this.state.title, number: this.state.number});
        this.setState({title: ""});
        this.setState({number: ""});
    },

// Force updates whenever this **App**'s collection receives events.
    mixins: [BackboneMixin],

    handleUserInput: function (filterText) {
        this.setState({
            filterText: filterText
        });
    },

    render: function () {
        return (
            <div>
                <header className="full highlight">
                    <div
                        className={this.state.status==="online"?"full highlight-2 float-right":"full dark-2 float-right"}>
                        <p ref="status_area">{this.state.status === "online" ? "آنلاین" : "آفلاین"}</p></div>
                    <h1>address book</h1>

                    <div>
                        <form onSubmit={this.handleTitleFormSubmit}>
                            <input placeholder="نام" type="text" name="title"
                                   onChange={this.handleTitleChange}
                                   value={this.state.title}/>
                            <input placeholder="شماره" type="text" name="number"
                                   onChange={this.handleNumberChange}
                                   value={this.state.number}/>
                            <input type="submit" value="ارسال"/>
                        </form>
                    </div>
                    <SearchBar onUserInput={this.handleUserInput} filterText={this.state.filterText}/>
                </header>
                <MainComponent
                    collection={this.props.collection.search(this.state.filterText)}
                    toggleAllItemsCompleted={this.toggleAllItemsCompleted}/>
            </div>
        );
    }
});

// Create a new address collection and render the **App** into `#addressapp`.
React.render(
    <AppComponent collection={new AddressList()}/>,
    document.getElementById("addressapp")
);
