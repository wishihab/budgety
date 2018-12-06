//BUDGET CONTROLLER
var budgetController = (function() {

	//Data structure to insert expenses and incomes
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	//data structure to save all info inputed
	var data = {
		allItems: {
			income: [],
			expense: []
		},
		totals: {
			income: 0,
			expense: 0
		}
	};

	return {
		//making a public method to add item to our data structure
		addItem: function(type, desc, val) {
			var newItem;

			//create a new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
			

			//create new item based on type
			if (type === 'expense') {
				newItem = new Expense(ID, desc, val);
			} else if (type === 'income') {
				newItem = new Income(ID, desc, val);
			}

			//push into our data scructure
			data.allItems[type].push(newItem);

			//return the new item for other controllers access it
			return newItem;
		},

		testing: function() {
			console.log(data);
		}
	};
})();

//UI CONTROLLER
var UIController = (function() {
	var DOMStrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn'
	};

	return {
		//public method to get input from fields
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // will be either 'inc' or 'exp'
				description: document.querySelector(DOMStrings.inputDescription).value,
				value: document.querySelector(DOMStrings.inputValue).value
			};
		},
		//public method to get DOM fields
		getDOMStrings: function() {
			return DOMStrings;
		}
	};
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
	//event listeners on button and enter key
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
				event.preventDefault();
			}
		});
	};

	//add item
	var ctrlAddItem = function() {
		var input, newItem;

		// 1. get the field input data
		input = UICtrl.getInput();

		// 2. Add the item to the budget controller
		newItem = budgetController.addItem(input.type, input.description, input.value);

		// 3. Add the item to the UI

		// 4. Calculate de budget

		// 5. Display the budget on the UI
	};

	return {
		//return public function to setup event listeners and start app
		init: function() {
			console.log('App has started.');
			setupEventListeners();
		}
	};
})(budgetController, UIController);

controller.init();
