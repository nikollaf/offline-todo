(function() {

	// 'global' variable to store the reference to the database 
	// reference http://www.smashingmagazine.com/2014/09/02/building-simple-cross-browser-offline-todo-list-indexeddb-websql/
	var db, input;

	databaseOpen(function() {
		
		input = document.querySelector('input');
		document.body.addEventListener('submit', onSubmit);

		databaseTodosGet(function(todos) {
			console.log(todos);
		});
	});

	function onSubmit(e) {
		e.preventDefault();
		// add function
		databaseTodosAdd(input.value, function() {
			input.value = '';
		});
	}


	// open up the database 
	function databaseOpen(callback) {
		// Open a databasem specify the name and version
		var version = 1;
		var request = indexedDB.open('todos', version);

		// Run migrations if necessary
		request.onupgradeneeded = function(e) {
			db = e.target.result;
			e.target.transaction.onerror = databaseError;
			db.createObjectStore('todo', { keyPath: 'timeStamp'});
		};

		request.onsuccess = function(e) {
			db = e.target.result;
			callback();
		};
		request.onerror = databaseError;
	}

	// in case of error
	function databaseError(e) {
		console.error('An indexedDB error has occured', e);
	}

	// add
	function databaseTodosAdd(text, callback) {
		var transaction = db.transaction(['todo'], 'readwrite');
		var store 		= transaction.objectStore('todo');
		var request 	= store.put({
			text: text,
			timeStamp: Date.now()
		});

		transaction.oncomplete = function(e) {
			callback();
		};
		request.onerror = databaseError;
	}

	// retrieve
	function databaseTodosGet(callback) {
		var transaction = db.transaction(['todo'], 'readonly');
		var store 		= transaction.objectStore('todo');

		// Get everything in the store
		var keyRange 		= IDBKeyRange.lowerBound(0);
		var cursorRequest	= store.openCursor(keyRange);

		// This fires once per row in the store. So, for simplicity
		// collect the data in an array (data), and pass it in the
		// callback in one go
		var data = [];
		cursorRequest.onsuccess = function(e) {
			var result = e.target.result;

			// if there's data, add it to array
			if (result) {
				data.push(result.value);
				result.continue();
			// reach the end of the data
			} else {
				callback(data);
			}
		};
	}

}());