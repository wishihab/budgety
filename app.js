//BUDGET CONTROLLER
var budgetController = (function() {
  //Data structure to insert expenses and incomes
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
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
    },
    budget: 0,
    percentageUsed: -1
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
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

    deleteItem: function(type, id) {
      var ids, index;
      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function() {
      // 1. calculate total income and expenses
      calculateTotal('expense');
      calculateTotal('income');

      // 2. calculate the budget: income-expenses
      data.budget = data.totals.income - data.totals.expense;

      // 3. calculate the % of income used already
      if (data.totals.income > 0) {
        data.percentageUsed = Math.round((data.totals.expense / data.totals.income) * 100);
      } else {
        data.percentageUsed = -1;
      }
    },

    calculatePercentages: function() {
      data.allItems.expense.forEach(function(cur) {
        cur.calcPercentage(data.totals.income);
      });
    },

    getPercentages: function() {
      var allPerc = data.allItems.expense.map(function(cur) {
        return cur.getPercentage();
      });
      return allPerc;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalIncome: data.totals.income,
        totalExpense: data.totals.expense,
        percentage: data.percentageUsed
      };
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
    inputBtn: '.add__btn',
    incomeContainer: '.income__list',
    expenseContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expensesLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  //Accepts a number and a type, and changes the sign to -/+ accordingly
  //Puts , on thousands
  var formatNumber = function(number, type) {
    var numSplit, int, dec, type;
    num = Math.abs(number);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
    }
    dec = numSplit[1];

    return (type === 'expense' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  return {
    //public method to get input from fields
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // will be either 'inc' or 'exp'
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
      };
    },

    //Add list of expense/income to the UI
    addListItem: function(obj, type) {
      var html, newHtml, element;
      //Create HTMl string with placeholder text
      if (type === 'income') {
        element = DOMStrings.incomeContainer;
        html =
          '<div class="item clearfix" id="income-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'expense') {
        element = DOMStrings.expenseContainer;
        html =
          '<div class="item clearfix" id="expense-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Replace Placeholder text with data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%desc%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    //delete list from DOM
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    //clear input fields after adding item
    clearFields: function() {
      var fields, fieldsArr;
      fields = document.querySelectorAll(
        DOMStrings.inputDescription + ', ' + DOMStrings.inputValue
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();
    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? (type = 'income') : (type = 'expense');
      document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(
        obj.totalIncome,
        'income'
      );
      document.querySelector(DOMStrings.expensesLabel).textContent = formatNumber(
        obj.totalExpense,
        'expense'
      );

      if (obj.percentage > 0) {
        document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.percentageLabel).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {
      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);

      Array.prototype.forEach.call(fields, function(current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });
    },

    displayMonth: function() {
      var now, year, month, months;
      now = new Date();
      months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();
      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year;
    },

    changedType: function() {
      var fields  = document.querySelectorAll(
        DOMStrings.inputType + ',' + DOMStrings.inputDescription + ',' + DOMStrings.inputValue
      );

      Array.prototype.forEach.call(fields, function(current) {
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');


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
    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  //update the budget
  var updateBuget = function() {
    // 5. Calculate de budget
    budgetCtrl.calculateBudget();

    // 6. Return the budget
    var budget = budgetCtrl.getBudget();

    // 7. Display the budget on the UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {
    // 1. Calculate the percentages of each item
    budgetCtrl.calculatePercentages();

    // 2. Read them from budget controller
    var percentages = budgetCtrl.getPercentages();

    // 3. Update UI
    UICtrl.displayPercentages(percentages);
  };

  //add item
  var ctrlAddItem = function() {
    var input, newItem;

    // 1. get the field input data
    input = UICtrl.getInput();

    //check if there is data on fields
    if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget controller
      newItem = budgetController.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI
      UICtrl.addListItem(newItem, input.type);

      // 4. Clear the fields
      UICtrl.clearFields();

      // 5. Calculate and update budget
      updateBuget();

      // 6. Calculate and update the percentages
      updatePercentages();
    }
  };

  //delete item
  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item from data structure
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from UI
      UICtrl.deleteListItem(itemID);

      // 3. Update and show new budget
      updateBuget();

      // 4. Calculate and update the percentages
      updatePercentages();
    }
  };

  return {
    //return public function to setup event listeners and start app
    init: function() {
      console.log('App has started.');
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalIncome: 0,
        totalExpense: 0,
        percentage: -1
      });
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
